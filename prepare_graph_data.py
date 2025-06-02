import json

# The strict, correct application lifecycle sequence
lifecycle = [
    "Application Submission",
    "Initial Assessment",
    "Rejected",
    "Initial Assessment",
    "Rejected",
    "Pre-Approval",
    "Appraisal Request",
    "Valuation Accepted",
    "Underwriting Approved",
    "Final Approval",
    "Signing of Loan Agreement",
    "Loan Funding",
    "Disbursement of Funds",
    "Loan Closure"
]

# Load the input JSON
data = None
with open('public/sopdeviation.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

# Aggregate pattern counts for each step in the strict lifecycle
pattern_counts = {step: 0 for step in lifecycle}
for entry in data['data']:
    seq = entry['sop_deviation_sequence_preview']
    count = int(entry['pattern_count'])
    for step in lifecycle:
        if step in seq:
            pattern_counts[step] += count

# Build the graph strictly as per the lifecycle
nodes = []
y_gap = 120
for idx, step in enumerate(lifecycle):
    nodes.append({
        "id": step,
        "type": "customCircleLabel",
        "data": {"label": f"{step} ({pattern_counts[step]})"},
        "position": {"x": 0, "y": idx * y_gap}
    })

edges = []
for i in range(len(lifecycle) - 1):
    edges.append({
        "id": f"{lifecycle[i]}->{lifecycle[i+1]}",
        "source": lifecycle[i],
        "target": lifecycle[i+1],
        "label": "",
        "type": "default"
    })

graph_data = {
    "nodes": nodes,
    "edges": edges
}

with open('public/graph_data.json', 'w', encoding='utf-8') as f:
    json.dump(graph_data, f, indent=2)
