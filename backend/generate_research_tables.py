
"""
Generate research tables and figures from MongoDB data for the HCI ASR inequity study.

Usage:
    pip install pymongo pandas numpy matplotlib scipy statsmodels openpyxl
    python generate_research_tables.py

Edit the configuration section below before running.
"""

from pymongo import MongoClient
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt

# =========================
# Configuration
# =========================
MONGO_URI = "mongodb+srv://6733272721_db_user:q0ELylErPvDH68Hk@cluster0.ej2uwfh.mongodb.net/?appName=Cluster0"
DB_NAME = "test"
COLLECTION = "audios"

MODEL_MAP = {
    "whisper": "Whisper Large-v3",
    "deepgram": "Deepgram Nova-2",
    "assembly": "AssemblyAI Universal-1",
}

TASK_CATEGORY = {
    1: "Morphological",
    2: "Phonological",
    3: "Prosodic",
    4: "Articulatory",
    5: "Syntactic",
}


def get_clarity(doc):
    ratings = doc.get("professorRatings", [])
    if not ratings:
        return None
    # use the most recent rating if multiple exist
    latest = sorted(
        ratings,
        key=lambda x: x.get("timestamp", {}).get("$date", "") if isinstance(x.get("timestamp"), dict) else str(x.get("timestamp", "")),
    )[-1]
    val = latest.get("clarity")
    if val == "clear":
        return "High Clarity"
    elif val == "unclear":
        return "Low Clarity"
    return None


def flatten_documents(docs):
    participant_rows = []
    eval_rows = []
    ux_rows = []

    for doc in docs:
        participant_id = str(doc.get("_id", doc.get("name", "")))
        age = doc.get("age")
        clarity = get_clarity(doc)

        participant_rows.append({
            "participant_id": participant_id,
            "age": age,
            "clarity": clarity,
        })

        for ev in doc.get("evaluations", []):
            task = ev.get("taskNumber")
            models = ev.get("models", {})
            for key, display_name in MODEL_MAP.items():
                if key not in models:
                    continue
                m = models[key]
                if m.get("wer") is None:
                    continue
                eval_rows.append({
                    "participant_id": participant_id,
                    "age": age,
                    "clarity": clarity,
                    "task": task,
                    "category": TASK_CATEGORY.get(task, f"Task {task}"),
                    "model_key": key,
                    "model": display_name,
                    "wer": float(m.get("wer", 0)) * 100.0,
                    "substitutions": m.get("substitutions", 0) or 0,
                    "deletions": m.get("deletions", 0) or 0,
                    "insertions": m.get("insertions", 0) or 0,
                })

        for rating in doc.get("ratings", []):
            model_key = rating.get("modelName")
            if model_key not in MODEL_MAP:
                continue
            r = rating.get("ratings", {})
            # q0 is often overall accuracy; q1-q3 may be negatively framed.
            ux_rows.append({
                "participant_id": participant_id,
                "clarity": clarity,
                "model": MODEL_MAP[model_key],
                "accuracy": r.get("q0"),
                "frustration": r.get("q1"),
                "effort": r.get("q2"),
                "trust": r.get("q3"),
            })

    return (
        pd.DataFrame(participant_rows),
        pd.DataFrame(eval_rows),
        pd.DataFrame(ux_rows),
    )


def participant_table(participants):
    def summarize(df):
        ages = pd.to_numeric(df["age"], errors="coerce").dropna()
        if len(ages) == 0:
            return [len(df), np.nan, ""]
        return [len(df), round(ages.mean(), 2), f"{int(ages.min())}-{int(ages.max())}"]

    cols = ["High Clarity", "Low Clarity", "Total"]
    out = pd.DataFrame(
        index=["Number of Participants", "Mean age (years)", "Age Range"],
        columns=cols
    )

    for label in ["High Clarity", "Low Clarity"]:
        vals = summarize(participants[participants["clarity"] == label])
        out[label] = vals

    out["Total"] = summarize(participants)
    out.index.name = "Characteristic"
    return out


def mean_sd(series):
    return f"{series.mean():.2f} ({series.std(ddof=1):.2f})"


def create_outputs(participants, evals, ux):
    writer = pd.ExcelWriter("research_results.xlsx", engine="openpyxl")

    # Table 1
    t1 = participant_table(participants)
    t1.to_excel(writer, sheet_name="Table1_Participants")

    # Figure 1
    ages = pd.to_numeric(participants["age"], errors="coerce").dropna()
    if len(ages):
        plt.figure(figsize=(6, 4))
        plt.hist(ages, bins=min(10, max(3, len(np.unique(ages)))))
        plt.xlabel("Age (years)")
        plt.ylabel("Number of Participants")
        plt.title("Age Distribution of Study Participants")
        plt.tight_layout()
        plt.savefig("fig1_age_distribution.png")
        plt.close()

    # Table 2 Mean WER
    rows = []
    for model in evals["model"].dropna().unique():
        sub = evals[evals["model"] == model]
        hi = sub[sub["clarity"] == "High Clarity"]["wer"]
        lo = sub[sub["clarity"] == "Low Clarity"]["wer"]
        rows.append({
            "ASR Model": model,
            "High Clarity Mean WER (SD)": mean_sd(hi) if len(hi) else "",
            "Low Clarity Mean WER (SD)": mean_sd(lo) if len(lo) else "",
            "Δ (pp)": round(lo.mean() - hi.mean(), 2) if len(hi) and len(lo) else np.nan,
        })
    t2 = pd.DataFrame(rows).sort_values("Δ (pp)")
    t2["Rank"] = range(1, len(t2) + 1)
    t2.to_excel(writer, sheet_name="Table2_WER", index=False)

    # Figure 2 Mean WER
    if not evals.empty:
        summary = evals.groupby(["model", "clarity"])["wer"].agg(["mean", "std"]).reset_index()
        pivot_mean = summary.pivot(index="model", columns="clarity", values="mean")
        pivot_std = summary.pivot(index="model", columns="clarity", values="std")
        ax = pivot_mean.plot(kind="bar", yerr=pivot_std, figsize=(8, 4), capsize=4)
        ax.set_ylabel("WER (%)")
        ax.set_title("Mean WER by Model and Clarity Group")
        plt.tight_layout()
        plt.savefig("fig2_mean_wer.png")
        plt.close()

    # Tables 3-5 Error types
    for metric, sheet in [
        ("substitutions", "Table3_Substitutions"),
        ("deletions", "Table4_Deletions"),
        ("insertions", "Table5_Insertions"),
    ]:
        temp = evals.groupby(["model", "clarity"])[metric].mean().unstack()
        temp["Δ (Low-High)"] = temp.get("Low Clarity", np.nan) - temp.get("High Clarity", np.nan)
        temp.to_excel(writer, sheet_name=sheet)

    # Table 6 Stimulus categories
    cat = evals.groupby(["category", "clarity"])["wer"].mean().unstack()
    cat["Δ (pp)"] = cat.get("Low Clarity", np.nan) - cat.get("High Clarity", np.nan)
    cat = cat.sort_values("Δ (pp)", ascending=False)
    overall = pd.DataFrame({
        "High Clarity": [evals[evals["clarity"] == "High Clarity"]["wer"].mean()],
        "Low Clarity": [evals[evals["clarity"] == "Low Clarity"]["wer"].mean()],
    }, index=["Overall"])
    overall["Δ (pp)"] = overall["Low Clarity"] - overall["High Clarity"]
    cat = pd.concat([cat, overall])
    cat.to_excel(writer, sheet_name="Table6_Stimulus")

    # Table 7 Correlation matrix
    if not evals.empty and not ux.empty:
        eval_mean = evals.groupby("participant_id")[["wer", "substitutions", "deletions", "insertions"]].mean()
        ux_mean = ux.groupby("participant_id")[["accuracy", "frustration", "effort", "trust"]].mean()
        merged = eval_mean.join(ux_mean, how="inner")
        corr = merged.corr()
        corr.to_excel(writer, sheet_name="Table7_Correlations")

        # Figure 3 WER vs Frustration
        if "frustration" in merged.columns:
            plt.figure(figsize=(6, 4))
            x = merged["wer"]
            y = merged["frustration"]
            plt.scatter(x, y)
            if len(x) > 1:
                z = np.polyfit(x, y, 1)
                p = np.poly1d(z)
                xs = np.linspace(x.min(), x.max(), 100)
                plt.plot(xs, p(xs))
            plt.xlabel("Word Error Rate (%)")
            plt.ylabel("Frustration")
            plt.title("WER vs Reported Frustration")
            plt.tight_layout()
            plt.savefig("fig3_wer_vs_frustration.png")
            plt.close()

        # Figure 4 UX Radar (using 4 available dimensions)
        dims = ["accuracy", "frustration", "effort", "trust"]
        radar = ux.groupby("clarity")[dims].mean()
        if {"High Clarity", "Low Clarity"}.issubset(radar.index):
            angles = np.linspace(0, 2*np.pi, len(dims), endpoint=False)
            angles = np.concatenate([angles, [angles[0]]])

            fig = plt.figure(figsize=(6, 6))
            ax = fig.add_subplot(111, polar=True)
            for label in ["High Clarity", "Low Clarity"]:
                values = radar.loc[label, dims].values
                values = np.concatenate([values, [values[0]]])
                ax.plot(angles, values, label=label)
                ax.fill(angles, values, alpha=0.1)
            ax.set_xticks(angles[:-1])
            ax.set_xticklabels(dims)
            ax.set_title("UX Radar Chart")
            ax.legend(loc="upper right", bbox_to_anchor=(1.3, 1.1))
            plt.tight_layout()
            plt.savefig("fig4_ux_radar.png")
            plt.close()

    # Figure 5 Fairness gap
    if not t2.empty:
        plt.figure(figsize=(7, 4))
        plt.bar(t2["ASR Model"], t2["Δ (pp)"])
        plt.ylabel("Δ (pp)")
        plt.title("Fairness Gap (Low Clarity − High Clarity)")
        plt.xticks(rotation=15)
        plt.tight_layout()
        plt.savefig("fig5_fairness_gap.png")
        plt.close()

    writer.close()


def main():
    print("Connecting to MongoDB...")
    client = MongoClient(MONGO_URI)
    docs = list(client[DB_NAME][COLLECTION].find({}))
    print(f"Loaded {len(docs)} participant documents.")

    participants, evals, ux = flatten_documents(docs)
    create_outputs(participants, evals, ux)

    print("Done.")
    print("Created:")
    print("  - research_results.xlsx")
    print("  - fig1_age_distribution.png")
    print("  - fig2_mean_wer.png")
    print("  - fig3_wer_vs_frustration.png")
    print("  - fig4_ux_radar.png")
    print("  - fig5_fairness_gap.png")


if __name__ == "__main__":
    main()
