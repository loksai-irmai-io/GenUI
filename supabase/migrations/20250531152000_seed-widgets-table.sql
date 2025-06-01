-- Seed widgets table with all required widget IDs for dashboard selection/pinning
INSERT INTO widgets (id, widget_category, widget_name, created_at, description)
VALUES
  ('sop-deviation', 'Process Analytics', 'SOP Deviation', NOW(), 'Deviation from standard operating procedures'),
  ('long-running-cases', 'Process Analytics', 'Long Running Cases', NOW(), 'Cases exceeding expected duration'),
  ('incomplete-cases', 'Process Analytics', 'Incomplete Cases', NOW(), 'Cases not completed within timeframe'),
  ('resource-switches', 'Process Analytics', 'Resource Switches', NOW(), 'Number of resource switches in cases'),
  ('rework-activities', 'Process Analytics', 'Rework Activities', NOW(), 'Activities repeated within cases'),
  ('timing-violations', 'Process Analytics', 'Timing Violations', NOW(), 'Violations of timing constraints'),
  ('case-complexity', 'Process Analytics', 'Case Complexity', NOW(), 'Complexity levels of cases'),
  ('resource-performance', 'Process Analytics', 'Resource Performance', NOW(), 'Performance metrics for resources'),
  ('timing-analysis', 'Process Analytics', 'Timing Analysis', NOW(), 'Detailed timing analysis of cases')
ON CONFLICT (id) DO NOTHING;
