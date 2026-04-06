// Company tags for DSA problems — maps problem URL to companies that ask it
// Source: LeetCode premium company tags + community reports

export const COMPANIES = [
  'Amazon', 'Google', 'Meta', 'Microsoft', 'Apple',
  'Netflix', 'Uber', 'Bloomberg', 'Adobe', 'Goldman Sachs',
  'Flipkart', 'Walmart', 'Oracle', 'Salesforce', 'LinkedIn',
];

// Map: LeetCode problem slug → company names
export const COMPANY_TAGS = {
  'two-sum': ['Amazon', 'Google', 'Meta', 'Microsoft', 'Apple', 'Adobe', 'Bloomberg'],
  'contains-duplicate': ['Amazon', 'Google', 'Apple', 'Adobe'],
  'valid-anagram': ['Amazon', 'Google', 'Microsoft', 'Bloomberg'],
  'best-time-to-buy-and-sell-stock': ['Amazon', 'Google', 'Meta', 'Microsoft', 'Goldman Sachs'],
  'majority-element': ['Amazon', 'Google', 'Microsoft'],
  'group-anagrams': ['Amazon', 'Google', 'Meta', 'Microsoft', 'Bloomberg'],
  'top-k-frequent-elements': ['Amazon', 'Google', 'Meta', 'Apple', 'Uber'],
  'longest-consecutive-sequence': ['Amazon', 'Google', 'Meta', 'Microsoft'],
  'valid-palindrome': ['Amazon', 'Meta', 'Microsoft'],
  'valid-parentheses': ['Amazon', 'Google', 'Meta', 'Microsoft', 'Bloomberg'],
  'longest-common-prefix': ['Amazon', 'Google', 'Adobe'],
  'longest-palindromic-substring': ['Amazon', 'Google', 'Meta', 'Microsoft'],
  'happy-number': ['Amazon', 'Apple'],
  'middle-of-the-linked-list': ['Amazon', 'Google', 'Meta'],
  'palindrome-linked-list': ['Amazon', 'Meta', 'Microsoft'],
  'linked-list-cycle-ii': ['Amazon', 'Google', 'Microsoft'],
  'remove-nth-node-from-end-of-list': ['Amazon', 'Google', 'Meta'],
  'find-the-duplicate-number': ['Amazon', 'Google', 'Microsoft'],
  'two-sum-ii-input-array-is-sorted': ['Amazon', 'Google', 'Bloomberg'],
  '3sum': ['Amazon', 'Google', 'Meta', 'Microsoft', 'Bloomberg'],
  'sort-colors': ['Amazon', 'Google', 'Meta', 'Microsoft'],
  'container-with-most-water': ['Amazon', 'Google', 'Meta', 'Microsoft', 'Goldman Sachs'],
  'trapping-rain-water': ['Amazon', 'Google', 'Meta', 'Microsoft', 'Goldman Sachs', 'Bloomberg'],
  'product-of-array-except-self': ['Amazon', 'Google', 'Meta', 'Microsoft', 'Apple'],
  'subarray-sum-equals-k': ['Amazon', 'Google', 'Meta', 'Microsoft'],
  'maximum-product-subarray': ['Amazon', 'Google', 'Microsoft', 'LinkedIn'],
  'merge-intervals': ['Amazon', 'Google', 'Meta', 'Microsoft', 'Bloomberg'],
  'insert-interval': ['Amazon', 'Google', 'Meta', 'LinkedIn'],
  'non-overlapping-intervals': ['Amazon', 'Google', 'Meta'],
  'search-in-rotated-sorted-array': ['Amazon', 'Google', 'Meta', 'Microsoft', 'Bloomberg'],
  'find-minimum-in-rotated-sorted-array': ['Amazon', 'Google', 'Meta', 'Microsoft'],
  'find-peak-element': ['Amazon', 'Google', 'Meta'],
  'koko-eating-bananas': ['Amazon', 'Google'],
  'median-of-two-sorted-arrays': ['Amazon', 'Google', 'Meta', 'Microsoft', 'Goldman Sachs'],
  'missing-number': ['Amazon', 'Google', 'Microsoft', 'Apple'],
  'first-missing-positive': ['Amazon', 'Google', 'Meta', 'Microsoft'],
  'single-number': ['Amazon', 'Google', 'Apple'],
  'reverse-linked-list': ['Amazon', 'Google', 'Meta', 'Microsoft', 'Apple', 'Bloomberg'],
  'reverse-linked-list-ii': ['Amazon', 'Google', 'Meta', 'Microsoft'],
  'reverse-nodes-in-k-group': ['Amazon', 'Google', 'Meta', 'Microsoft'],
  'rotate-image': ['Amazon', 'Google', 'Meta', 'Microsoft'],
  'spiral-matrix': ['Amazon', 'Google', 'Meta', 'Microsoft'],
  'set-matrix-zeroes': ['Amazon', 'Google', 'Meta', 'Microsoft'],
  'rotting-oranges': ['Amazon', 'Google', 'Meta', 'Microsoft'],
  'word-ladder': ['Amazon', 'Google', 'Meta', 'Microsoft'],
  'number-of-islands': ['Amazon', 'Google', 'Meta', 'Microsoft', 'Bloomberg'],
  'combination-sum': ['Amazon', 'Google', 'Meta', 'Microsoft'],
  'generate-parentheses': ['Amazon', 'Google', 'Meta', 'Microsoft', 'Uber'],
  'n-queens': ['Amazon', 'Google', 'Meta', 'Microsoft'],
  'word-search': ['Amazon', 'Google', 'Meta', 'Microsoft'],
  'top-k-frequent-elements': ['Amazon', 'Google', 'Meta', 'Apple', 'Uber'],
  'kth-largest-element-in-an-array': ['Amazon', 'Google', 'Meta', 'Microsoft'],
  'merge-k-sorted-lists': ['Amazon', 'Google', 'Meta', 'Microsoft'],
  'find-median-from-data-stream': ['Amazon', 'Google', 'Meta', 'Microsoft'],
  'next-greater-element-ii': ['Amazon', 'Google', 'Bloomberg'],
  'daily-temperatures': ['Amazon', 'Google', 'Meta', 'Bloomberg'],
  'largest-rectangle-in-histogram': ['Amazon', 'Google', 'Meta', 'Microsoft'],
  'binary-tree-level-order-traversal': ['Amazon', 'Google', 'Meta', 'Microsoft'],
  'maximum-depth-of-binary-tree': ['Amazon', 'Google', 'Meta', 'Microsoft'],
  'diameter-of-binary-tree': ['Amazon', 'Google', 'Meta'],
  'binary-tree-maximum-path-sum': ['Amazon', 'Google', 'Meta', 'Microsoft'],
  'validate-binary-search-tree': ['Amazon', 'Google', 'Meta', 'Microsoft', 'Bloomberg'],
  'lowest-common-ancestor-of-a-binary-tree': ['Amazon', 'Google', 'Meta', 'Microsoft'],
  'coin-change': ['Amazon', 'Google', 'Meta', 'Microsoft', 'Goldman Sachs'],
  'longest-increasing-subsequence': ['Amazon', 'Google', 'Meta', 'Microsoft'],
  'longest-common-subsequence': ['Amazon', 'Google', 'Meta'],
  'edit-distance': ['Amazon', 'Google', 'Meta', 'Microsoft'],
  'unique-paths-ii': ['Amazon', 'Google', 'Meta'],
  'maximal-square': ['Amazon', 'Google', 'Meta', 'Microsoft'],
  'house-robber-ii': ['Amazon', 'Google', 'Microsoft'],
  'target-sum': ['Amazon', 'Google', 'Meta'],
  'course-schedule': ['Amazon', 'Google', 'Meta', 'Microsoft'],
  'course-schedule-ii': ['Amazon', 'Google', 'Meta', 'Microsoft'],
  'accounts-merge': ['Amazon', 'Google', 'Meta'],
  'lru-cache': ['Amazon', 'Google', 'Meta', 'Microsoft', 'Bloomberg', 'Goldman Sachs'],
  'lfu-cache': ['Amazon', 'Google', 'Meta'],
  'design-twitter': ['Amazon', 'Google', 'Meta'],
  'min-stack': ['Amazon', 'Google', 'Meta', 'Microsoft', 'Bloomberg'],
  'evaluate-reverse-polish-notation': ['Amazon', 'Google', 'Microsoft'],
  'decode-string': ['Amazon', 'Google', 'Meta', 'Microsoft'],
  'asteroid-collision': ['Amazon', 'Google'],
  'jump-game-ii': ['Amazon', 'Google', 'Meta', 'Microsoft'],
  'gas-station': ['Amazon', 'Google', 'Bloomberg'],
  'candy': ['Amazon', 'Google', 'Meta'],
  'longest-substring-without-repeating-characters': ['Amazon', 'Google', 'Meta', 'Microsoft', 'Bloomberg'],
  'minimum-window-substring': ['Amazon', 'Google', 'Meta', 'Microsoft', 'Uber'],
  'sliding-window-maximum': ['Amazon', 'Google', 'Meta', 'Microsoft'],
  'permutation-in-string': ['Amazon', 'Google', 'Microsoft'],
};

// Helper: extract slug from LeetCode URL
export const getSlugFromUrl = (url) => {
  const match = url.match(/leetcode\.com\/problems\/([^/]+)/);
  return match ? match[1] : null;
};

// Helper: get companies for a problem URL
export const getCompaniesForProblem = (url) => {
  const slug = getSlugFromUrl(url);
  return slug ? (COMPANY_TAGS[slug] || []) : [];
};

// Helper: get all unique companies across all tagged problems
export const getAllCompanies = () => COMPANIES;
