import os
os.environ["HF_HUB_OFFLINE"] = "1"
os.environ["TRANSFORMERS_OFFLINE"] = "1"

import json
import time
from datetime import datetime
import chatbot_core as core

TEST_DATA_PATH = "test_data.json"
REPORT_PATH = "test_report.json"
REPORT_TXT_PATH = "test_report.txt"


def load_tests():
    with open(TEST_DATA_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


def check_source_match(expected, actual):
    if expected == "rejected":
        return actual in ("rejected", "none")
    if expected == "none":
        return actual in ("none", "rejected")
    if expected == "qa_or_video":
        return actual in ("qa", "video")
    return expected == actual


def run_all_tests():
    tests = load_tests()
    results = []
    categories = {}

    print("=" * 60)
    print(f"🧪 Running {len(tests)} tests...")
    print("=" * 60)

    total_start = time.time()

    for t in tests:
        tid = t["id"]
        cat = t["category"]
        question = t["question"]
        expected = t["expected_source"]
        desc = t["description"]

        print(f"\n[{tid:03d}] {cat} | {question[:50]}...")

        start = time.time()

        try:
            if not question.strip():
                response = {
                    "answer": "empty",
                    "source": "rejected",
                    "rejection_reason": "empty_input"
                }
            else:
                response = core.chatbot_response(question)
        except Exception as e:
            response = {
                "answer": f"ERROR: {str(e)}",
                "source": "error"
            }

        elapsed = time.time() - start
        actual_source = response.get("source", "unknown")
        passed = check_source_match(expected, actual_source)

        icon = "✅" if passed else "❌"
        print(f"  {icon} Expected: {expected} | Got: {actual_source} "
              f"| Time: {elapsed:.2f}s")

        result = {
            "id": tid,
            "category": cat,
            "description": desc,
            "question": question,
            "expected_source": expected,
            "actual_source": actual_source,
            "passed": passed,
            "time": round(elapsed, 3),
            "score": response.get("score", None),
            "rerank_score": response.get("rerank_score", None),
            "answer_preview": response.get("answer", "")[:200],
            "rejection_reason": response.get("rejection_reason", None),
        }
        results.append(result)

        if cat not in categories:
            categories[cat] = {"total": 0, "passed": 0, "failed": []}
        categories[cat]["total"] += 1
        if passed:
            categories[cat]["passed"] += 1
        else:
            categories[cat]["failed"].append(result)

    total_time = time.time() - total_start

    return results, categories, total_time


def generate_report(results, categories, total_time):
    total = len(results)
    passed = sum(1 for r in results if r["passed"])
    failed = total - passed
    accuracy = (passed / total * 100) if total > 0 else 0
    avg_time = total_time / total if total > 0 else 0

    report_lines = []

    def p(line=""):
        print(line)
        report_lines.append(line)

    p("\n" + "=" * 60)
    p("📊 TEST REPORT")
    p("=" * 60)
    p(f"📅 Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    p(f"📝 Total Tests: {total}")
    p(f"✅ Passed: {passed}")
    p(f"❌ Failed: {failed}")
    p(f"🎯 Accuracy: {accuracy:.1f}%")
    p(f"⏱  Total Time: {total_time:.1f}s")
    p(f"⏱  Avg per Question: {avg_time:.2f}s")

    p("\n" + "-" * 60)
    p("📋 RESULTS BY CATEGORY")
    p("-" * 60)

    for cat, data in categories.items():
        cat_acc = (data["passed"] / data["total"] * 100) if data["total"] > 0 else 0
        icon = "✅" if cat_acc == 100 else "⚠️" if cat_acc >= 70 else "❌"
        p(f"\n{icon} {cat.upper()}")
        p(f"   Passed: {data['passed']}/{data['total']} ({cat_acc:.0f}%)")

        if data["failed"]:
            p(f"   Failed questions:")
            for f_item in data["failed"]:
                p(f"     ❌ [{f_item['id']:03d}] {f_item['question'][:50]}")
                p(f"        Expected: {f_item['expected_source']} "
                  f"| Got: {f_item['actual_source']}")
                if f_item.get("rejection_reason"):
                    p(f"        Reason: {f_item['rejection_reason']}")

    p("\n" + "-" * 60)
    p("🔍 ALL FAILED TESTS")
    p("-" * 60)

    failed_items = [r for r in results if not r["passed"]]
    if not failed_items:
        p("   🎉 No failures!")
    else:
        for f_item in failed_items:
            p(f"\n   ❌ Test #{f_item['id']:03d} [{f_item['category']}]")
            p(f"      Question: {f_item['question']}")
            p(f"      Expected: {f_item['expected_source']}")
            p(f"      Got:      {f_item['actual_source']}")
            p(f"      Score:    {f_item.get('score', 'N/A')}")
            p(f"      Rerank:   {f_item.get('rerank_score', 'N/A')}")
            p(f"      Answer:   {f_item['answer_preview'][:100]}...")

    p("\n" + "-" * 60)
    p("⏱  SPEED ANALYSIS")
    p("-" * 60)

    times = [r["time"] for r in results]
    p(f"   Fastest: {min(times):.3f}s")
    p(f"   Slowest: {max(times):.3f}s")
    p(f"   Average: {sum(times)/len(times):.3f}s")

    slow = [r for r in results if r["time"] > 5.0]
    if slow:
        p(f"\n   ⚠️ Slow responses (>5s):")
        for s in slow:
            p(f"     [{s['id']:03d}] {s['time']:.2f}s | {s['question'][:40]}")

    p("\n" + "=" * 60)
    p(f"🎯 FINAL ACCURACY: {accuracy:.1f}%")
    p("=" * 60)

    report_json = {
        "date": datetime.now().isoformat(),
        "summary": {
            "total": total,
            "passed": passed,
            "failed": failed,
            "accuracy": round(accuracy, 2),
            "total_time": round(total_time, 2),
            "avg_time": round(avg_time, 3),
        },
        "categories": {
            cat: {
                "total": d["total"],
                "passed": d["passed"],
                "accuracy": round(
                    d["passed"] / d["total"] * 100, 2
                ) if d["total"] > 0 else 0,
                "failed_ids": [f["id"] for f in d["failed"]],
            }
            for cat, d in categories.items()
        },
        "results": results,
    }

    with open(REPORT_PATH, "w", encoding="utf-8") as f:
        json.dump(report_json, f, ensure_ascii=False, indent=2)

    with open(REPORT_TXT_PATH, "w", encoding="utf-8") as f:
        f.write("\n".join(report_lines))

    print(f"\n💾 JSON Report: {REPORT_PATH}")
    print(f"💾 Text Report: {REPORT_TXT_PATH}")


if __name__ == "__main__":
    results, categories, total_time = run_all_tests()
    generate_report(results, categories, total_time)