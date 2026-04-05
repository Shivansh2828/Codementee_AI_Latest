export const DSA_META = {
  title: 'DSA Patterns',
  subtitle: 'Master coding interviews by learning patterns, not memorizing solutions',
  description: 'A curated list of LeetCode problems organized by pattern. Solve 3-5 problems per pattern and you\'ll recognize them in any interview.',
  totalPatterns: 25,
  totalProblems: 210,
};

export const DSA_PATTERNS = [
  // ── EASY ─────────────────────────────────────────────────────────────────
  {
    id: 'arrays-hashing', title: 'Arrays & Hashing', difficulty: 'Easy', color: 'green',
    description: 'The most fundamental pattern. Use hash maps for O(1) lookups, frequency counting, and grouping. Arrays are the building block of everything.',
    whenToUse: 'Frequency counting, duplicate detection, grouping, two-sum variants, anagram problems.',
    problems: [
      { name: 'Two Sum', url: 'https://leetcode.com/problems/two-sum/', difficulty: 'Easy' },
      { name: 'Contains Duplicate', url: 'https://leetcode.com/problems/contains-duplicate/', difficulty: 'Easy' },
      { name: 'Valid Anagram', url: 'https://leetcode.com/problems/valid-anagram/', difficulty: 'Easy' },
      { name: 'Best Time to Buy and Sell Stock', url: 'https://leetcode.com/problems/best-time-to-buy-and-sell-stock/', difficulty: 'Easy' },
      { name: 'Majority Element', url: 'https://leetcode.com/problems/majority-element/', difficulty: 'Easy' },
      { name: 'Group Anagrams', url: 'https://leetcode.com/problems/group-anagrams/', difficulty: 'Medium' },
      { name: 'Top K Frequent Elements', url: 'https://leetcode.com/problems/top-k-frequent-elements/', difficulty: 'Medium' },
      { name: 'Encode and Decode Strings', url: 'https://leetcode.com/problems/encode-and-decode-strings/', difficulty: 'Medium' },
      { name: 'Longest Consecutive Sequence', url: 'https://leetcode.com/problems/longest-consecutive-sequence/', difficulty: 'Medium' },
    ],
  },
  {
    id: 'strings', title: 'Strings', difficulty: 'Easy-Medium', color: 'blue',
    description: 'String manipulation, pattern matching, and palindrome problems. Key techniques: two pointers, hashing, sliding window on strings.',
    whenToUse: 'Palindrome checks, string reversal, pattern matching, substring problems, character frequency.',
    problems: [
      { name: 'Valid Palindrome', url: 'https://leetcode.com/problems/valid-palindrome/', difficulty: 'Easy' },
      { name: 'Valid Parentheses', url: 'https://leetcode.com/problems/valid-parentheses/', difficulty: 'Easy' },
      { name: 'Longest Common Prefix', url: 'https://leetcode.com/problems/longest-common-prefix/', difficulty: 'Easy' },
      { name: 'Reverse Words in a String', url: 'https://leetcode.com/problems/reverse-words-in-a-string/', difficulty: 'Medium' },
      { name: 'String to Integer (atoi)', url: 'https://leetcode.com/problems/string-to-integer-atoi/', difficulty: 'Medium' },
      { name: 'Longest Palindromic Substring', url: 'https://leetcode.com/problems/longest-palindromic-substring/', difficulty: 'Medium' },
      { name: 'Zigzag Conversion', url: 'https://leetcode.com/problems/zigzag-conversion/', difficulty: 'Medium' },
    ],
  },

  // ── EASY-MEDIUM ──────────────────────────────────────────────────────────
  {
    id: 'stack-queue', title: 'Stack, Queue & Deque', difficulty: 'Easy-Medium', color: 'purple',
    description: 'LIFO (stack) and FIFO (queue) are fundamental. Stacks for matching/nesting, queues for BFS/ordering, deques for sliding window.',
    whenToUse: 'Parentheses matching, expression evaluation, BFS, sliding window max/min, undo operations.',
    problems: [
      { name: 'Valid Parentheses', url: 'https://leetcode.com/problems/valid-parentheses/', difficulty: 'Easy' },
      { name: 'Implement Queue using Stacks', url: 'https://leetcode.com/problems/implement-queue-using-stacks/', difficulty: 'Easy' },
      { name: 'Implement Stack using Queues', url: 'https://leetcode.com/problems/implement-stack-using-queues/', difficulty: 'Easy' },
      { name: 'Min Stack', url: 'https://leetcode.com/problems/min-stack/', difficulty: 'Medium' },
      { name: 'Evaluate Reverse Polish Notation', url: 'https://leetcode.com/problems/evaluate-reverse-polish-notation/', difficulty: 'Medium' },
      { name: 'Simplify Path', url: 'https://leetcode.com/problems/simplify-path/', difficulty: 'Medium' },
      { name: 'Decode String', url: 'https://leetcode.com/problems/decode-string/', difficulty: 'Medium' },
      { name: 'Asteroid Collision', url: 'https://leetcode.com/problems/asteroid-collision/', difficulty: 'Medium' },
      { name: 'Basic Calculator II', url: 'https://leetcode.com/problems/basic-calculator-ii/', difficulty: 'Medium' },
    ],
  },
  {
    id: 'fast-slow-pointer', title: 'Fast & Slow Pointer', difficulty: 'Easy-Medium', color: 'cyan',
    description: 'Use two pointers moving at different speeds to detect cycles, find midpoints, or identify patterns in linked lists.',
    whenToUse: 'Linked list cycle detection, finding middle of list, detecting duplicates in sequences.',
    problems: [
      { name: 'Happy Number', url: 'https://leetcode.com/problems/happy-number/', difficulty: 'Easy' },
      { name: 'Middle of the Linked List', url: 'https://leetcode.com/problems/middle-of-the-linked-list/', difficulty: 'Easy' },
      { name: 'Palindrome Linked List', url: 'https://leetcode.com/problems/palindrome-linked-list/', difficulty: 'Easy' },
      { name: 'Linked List Cycle II', url: 'https://leetcode.com/problems/linked-list-cycle-ii/', difficulty: 'Medium' },
      { name: 'Remove Nth Node From End of List', url: 'https://leetcode.com/problems/remove-nth-node-from-end-of-list/', difficulty: 'Medium' },
      { name: 'Find the Duplicate Number', url: 'https://leetcode.com/problems/find-the-duplicate-number/', difficulty: 'Medium' },
    ],
  },
  {
    id: 'two-pointers', title: 'Two Pointers', difficulty: 'Easy-Medium', color: 'blue',
    description: 'Use two pointers (usually from both ends or same direction) to solve problems on sorted arrays or strings in O(n) time.',
    whenToUse: 'Sorted array pair finding, partitioning, removing duplicates, container problems.',
    problems: [
      { name: 'Two Sum II - Sorted Array', url: 'https://leetcode.com/problems/two-sum-ii-input-array-is-sorted/', difficulty: 'Medium' },
      { name: '3Sum', url: 'https://leetcode.com/problems/3sum/', difficulty: 'Medium' },
      { name: 'Sort Colors (Dutch National Flag)', url: 'https://leetcode.com/problems/sort-colors/', difficulty: 'Medium' },
      { name: 'Container With Most Water', url: 'https://leetcode.com/problems/container-with-most-water/', difficulty: 'Medium' },
      { name: 'Next Permutation', url: 'https://leetcode.com/problems/next-permutation/', difficulty: 'Medium' },
      { name: 'Bag of Tokens', url: 'https://leetcode.com/problems/bag-of-tokens/', difficulty: 'Medium' },
      { name: 'Trapping Rain Water', url: 'https://leetcode.com/problems/trapping-rain-water/', difficulty: 'Hard' },
    ],
  },
  {
    id: 'prefix-sum', title: 'Prefix Sum', difficulty: 'Easy-Medium', color: 'purple',
    description: 'Pre-compute cumulative sums to answer range queries in O(1). Transform "sum of subarray" into simple subtraction.',
    whenToUse: 'Range sum queries, subarray sum problems, finding equilibrium points.',
    problems: [
      { name: 'Find the Middle Index in Array', url: 'https://leetcode.com/problems/find-the-middle-index-in-array/', difficulty: 'Easy' },
      { name: 'Product of Array Except Self', url: 'https://leetcode.com/problems/product-of-array-except-self/', difficulty: 'Medium' },
      { name: 'Subarray Sum Equals K', url: 'https://leetcode.com/problems/subarray-sum-equals-k/', difficulty: 'Medium' },
      { name: 'Maximum Product Subarray', url: 'https://leetcode.com/problems/maximum-product-subarray/', difficulty: 'Medium' },
      { name: 'Range Sum Query 2D', url: 'https://leetcode.com/problems/range-sum-query-2d-immutable/', difficulty: 'Medium' },
    ],
  },
  {
    id: 'cyclic-sort', title: 'Cyclic Sort (Index-Based)', difficulty: 'Easy-Medium', color: 'cyan',
    description: 'When array contains numbers in range [1, n], place each number at its correct index. Missing/duplicate numbers become obvious.',
    whenToUse: 'Finding missing numbers, duplicates, or first missing positive in arrays with bounded range.',
    problems: [
      { name: 'Missing Number', url: 'https://leetcode.com/problems/missing-number/', difficulty: 'Easy' },
      { name: 'Find All Numbers Disappeared in an Array', url: 'https://leetcode.com/problems/find-all-numbers-disappeared-in-an-array/', difficulty: 'Easy' },
      { name: 'Set Mismatch', url: 'https://leetcode.com/problems/set-mismatch/', difficulty: 'Easy' },
      { name: 'First Missing Positive', url: 'https://leetcode.com/problems/first-missing-positive/', difficulty: 'Hard' },
    ],
  },
  {
    id: 'bitwise-xor', title: 'Bitwise XOR', difficulty: 'Easy-Medium', color: 'green',
    description: 'XOR has unique properties: a^a=0, a^0=a. Use it to find missing/single numbers without extra space.',
    whenToUse: 'Finding single/missing numbers, toggling bits, problems requiring O(1) space.',
    problems: [
      { name: 'Single Number', url: 'https://leetcode.com/problems/single-number/', difficulty: 'Easy' },
      { name: 'Missing Number', url: 'https://leetcode.com/problems/missing-number/', difficulty: 'Easy' },
      { name: 'Single Number II', url: 'https://leetcode.com/problems/single-number-ii/', difficulty: 'Medium' },
      { name: 'Single Number III', url: 'https://leetcode.com/problems/single-number-iii/', difficulty: 'Medium' },
      { name: 'XOR Queries of a Subarray', url: 'https://leetcode.com/problems/xor-queries-of-a-subarray/', difficulty: 'Medium' },
    ],
  },

  // ── MEDIUM ───────────────────────────────────────────────────────────────
  {
    id: 'sliding-window', title: 'Sliding Window', difficulty: 'Medium', color: 'green',
    description: 'Maintain a window of elements and slide it across the array. Fixed-size for known sizes, variable-size for optimization.',
    whenToUse: 'Subarray/substring problems, max/min in a range, contiguous sequence problems.',
    subcategories: [
      { name: 'Fixed Size', problems: [
        { name: 'Maximum Sum Subarray of Size K', url: 'https://leetcode.com/problems/maximum-average-subarray-i/', difficulty: 'Easy' },
        { name: 'Repeated DNA Sequences', url: 'https://leetcode.com/problems/repeated-dna-sequences/', difficulty: 'Medium' },
        { name: 'Permutation in String', url: 'https://leetcode.com/problems/permutation-in-string/', difficulty: 'Medium' },
        { name: 'Sliding Window Maximum', url: 'https://leetcode.com/problems/sliding-window-maximum/', difficulty: 'Hard' },
      ]},
      { name: 'Variable Size', problems: [
        { name: 'Longest Substring Without Repeating Characters', url: 'https://leetcode.com/problems/longest-substring-without-repeating-characters/', difficulty: 'Medium' },
        { name: 'Minimum Size Subarray Sum', url: 'https://leetcode.com/problems/minimum-size-subarray-sum/', difficulty: 'Medium' },
        { name: 'Fruits Into Baskets', url: 'https://leetcode.com/problems/fruit-into-baskets/', difficulty: 'Medium' },
        { name: 'Subarray Product Less Than K', url: 'https://leetcode.com/problems/subarray-product-less-than-k/', difficulty: 'Medium' },
        { name: 'Minimum Window Substring', url: 'https://leetcode.com/problems/minimum-window-substring/', difficulty: 'Hard' },
      ]},
    ],
  },
  {
    id: 'overlapping-intervals', title: 'Overlapping Intervals', difficulty: 'Medium', color: 'orange',
    description: 'Sort intervals by start time, then merge or process overlapping ones. Key insight: if current.start <= prev.end, they overlap.',
    whenToUse: 'Merging intervals, scheduling, finding conflicts, calendar problems.',
    problems: [
      { name: 'Merge Intervals', url: 'https://leetcode.com/problems/merge-intervals/', difficulty: 'Medium' },
      { name: 'Insert Interval', url: 'https://leetcode.com/problems/insert-interval/', difficulty: 'Medium' },
      { name: 'Non-overlapping Intervals', url: 'https://leetcode.com/problems/non-overlapping-intervals/', difficulty: 'Medium' },
      { name: 'Minimum Number of Arrows to Burst Balloons', url: 'https://leetcode.com/problems/minimum-number-of-arrows-to-burst-balloons/', difficulty: 'Medium' },
      { name: 'My Calendar II', url: 'https://leetcode.com/problems/my-calendar-ii/', difficulty: 'Medium' },
    ],
  },
  {
    id: 'linked-list-reversal', title: 'Linked List Reversal (In-place)', difficulty: 'Medium', color: 'blue',
    description: 'Reverse a linked list or portions of it by manipulating pointers. Core: next = curr.next, curr.next = prev, prev = curr.',
    whenToUse: 'Reversing linked lists, reversing in groups, palindrome checks on linked lists.',
    problems: [
      { name: 'Reverse Linked List', url: 'https://leetcode.com/problems/reverse-linked-list/', difficulty: 'Easy' },
      { name: 'Swap Nodes in Pairs', url: 'https://leetcode.com/problems/swap-nodes-in-pairs/', difficulty: 'Medium' },
      { name: 'Reverse Linked List II', url: 'https://leetcode.com/problems/reverse-linked-list-ii/', difficulty: 'Medium' },
      { name: 'Reverse Nodes in k-Group', url: 'https://leetcode.com/problems/reverse-nodes-in-k-group/', difficulty: 'Hard' },
    ],
  },
  {
    id: 'matrix', title: 'Matrix Manipulation', difficulty: 'Medium', color: 'purple',
    description: 'Traverse, rotate, or transform 2D matrices. Key patterns: spiral traversal, layer-by-layer rotation, in-place marking.',
    whenToUse: 'Matrix rotation, spiral order, setting rows/columns, game of life simulations.',
    problems: [
      { name: 'Rotate Image', url: 'https://leetcode.com/problems/rotate-image/', difficulty: 'Medium' },
      { name: 'Spiral Matrix', url: 'https://leetcode.com/problems/spiral-matrix/', difficulty: 'Medium' },
      { name: 'Set Matrix Zeroes', url: 'https://leetcode.com/problems/set-matrix-zeroes/', difficulty: 'Medium' },
      { name: 'Game of Life', url: 'https://leetcode.com/problems/game-of-life/', difficulty: 'Medium' },
    ],
  },
  {
    id: 'bfs', title: 'Breadth First Search (BFS)', difficulty: 'Medium', color: 'cyan',
    description: 'Explore level by level using a queue. BFS finds shortest path in unweighted graphs and processes nodes in order of distance.',
    whenToUse: 'Shortest path in unweighted graph, level-order traversal, spreading/infection problems.',
    problems: [
      { name: 'Rotten Oranges', url: 'https://leetcode.com/problems/rotting-oranges/', difficulty: 'Medium' },
      { name: 'Shortest Path in Binary Matrix', url: 'https://leetcode.com/problems/shortest-path-in-binary-matrix/', difficulty: 'Medium' },
      { name: 'As Far from Land as Possible', url: 'https://leetcode.com/problems/as-far-from-land-as-possible/', difficulty: 'Medium' },
      { name: 'Open the Lock', url: 'https://leetcode.com/problems/open-the-lock/', difficulty: 'Medium' },
      { name: 'Word Ladder', url: 'https://leetcode.com/problems/word-ladder/', difficulty: 'Hard' },
    ],
  },
  {
    id: 'dfs', title: 'Depth First Search (DFS)', difficulty: 'Medium', color: 'orange',
    description: 'Explore as deep as possible before backtracking. Use recursion or explicit stack for connectivity, cycle detection, path finding.',
    whenToUse: 'Island counting, connected components, cycle detection, path existence, boundary problems.',
    problems: [
      { name: 'Number of Islands', url: 'https://leetcode.com/problems/number-of-islands/', difficulty: 'Medium' },
      { name: 'Number of Closed Islands', url: 'https://leetcode.com/problems/number-of-closed-islands/', difficulty: 'Medium' },
      { name: 'Number of Enclaves', url: 'https://leetcode.com/problems/number-of-enclaves/', difficulty: 'Medium' },
      { name: 'Time Needed to Inform All Employees', url: 'https://leetcode.com/problems/time-needed-to-inform-all-employees/', difficulty: 'Medium' },
      { name: 'Find Eventual Safe States', url: 'https://leetcode.com/problems/find-eventual-safe-states/', difficulty: 'Medium' },
    ],
  },
  {
    id: 'top-k', title: 'Top K Elements', difficulty: 'Medium', color: 'blue',
    description: 'Use a heap (priority queue) to efficiently find the K largest/smallest/most frequent elements in O(n log k) time.',
    whenToUse: 'K largest/smallest, K most frequent, K closest points.',
    problems: [
      { name: 'Top K Frequent Elements', url: 'https://leetcode.com/problems/top-k-frequent-elements/', difficulty: 'Medium' },
      { name: 'Kth Largest Element in an Array', url: 'https://leetcode.com/problems/kth-largest-element-in-an-array/', difficulty: 'Medium' },
      { name: 'K Closest Points to Origin', url: 'https://leetcode.com/problems/k-closest-points-to-origin/', difficulty: 'Medium' },
      { name: 'Ugly Number II', url: 'https://leetcode.com/problems/ugly-number-ii/', difficulty: 'Medium' },
    ],
  },
  {
    id: 'greedy', title: 'Greedy', difficulty: 'Medium', color: 'green',
    description: 'Make the locally optimal choice at each step. Greedy works when local optimum leads to global optimum.',
    whenToUse: 'Scheduling, interval selection, jump games, gas station problems.',
    problems: [
      { name: 'Jump Game II', url: 'https://leetcode.com/problems/jump-game-ii/', difficulty: 'Medium' },
      { name: 'Gas Station', url: 'https://leetcode.com/problems/gas-station/', difficulty: 'Medium' },
      { name: 'Boats to Save People', url: 'https://leetcode.com/problems/boats-to-save-people/', difficulty: 'Medium' },
      { name: 'Car Pooling', url: 'https://leetcode.com/problems/car-pooling/', difficulty: 'Medium' },
      { name: 'Wiggle Subsequence', url: 'https://leetcode.com/problems/wiggle-subsequence/', difficulty: 'Medium' },
      { name: 'Candy', url: 'https://leetcode.com/problems/candy/', difficulty: 'Hard' },
    ],
  },

  // ── MEDIUM-HARD ──────────────────────────────────────────────────────────
  {
    id: 'binary-search', title: 'Modified Binary Search', difficulty: 'Medium-Hard', color: 'red',
    description: 'Apply binary search on sorted/rotated arrays or on the answer space itself. If the problem has monotonic property, binary search works.',
    whenToUse: 'Sorted/rotated arrays, search space reduction, optimization problems with monotonic check.',
    problems: [
      { name: 'Search in Rotated Sorted Array', url: 'https://leetcode.com/problems/search-in-rotated-sorted-array/', difficulty: 'Medium' },
      { name: 'Find Minimum in Rotated Sorted Array', url: 'https://leetcode.com/problems/find-minimum-in-rotated-sorted-array/', difficulty: 'Medium' },
      { name: 'Find Peak Element', url: 'https://leetcode.com/problems/find-peak-element/', difficulty: 'Medium' },
      { name: 'Koko Eating Bananas', url: 'https://leetcode.com/problems/koko-eating-bananas/', difficulty: 'Medium' },
      { name: 'Capacity to Ship Packages', url: 'https://leetcode.com/problems/capacity-to-ship-packages-within-d-days/', difficulty: 'Medium' },
      { name: 'Find in Mountain Array', url: 'https://leetcode.com/problems/find-in-mountain-array/', difficulty: 'Hard' },
      { name: 'Median of Two Sorted Arrays', url: 'https://leetcode.com/problems/median-of-two-sorted-arrays/', difficulty: 'Hard' },
    ],
  },
  {
    id: 'backtracking', title: 'Backtracking', difficulty: 'Medium-Hard', color: 'purple',
    description: 'Build solutions incrementally, abandoning a path as soon as it can\'t lead to a valid solution. Think of it as DFS with pruning.',
    whenToUse: 'Permutations, combinations, subset generation, constraint satisfaction (Sudoku, N-Queens).',
    problems: [
      { name: 'Combination Sum', url: 'https://leetcode.com/problems/combination-sum/', difficulty: 'Medium' },
      { name: 'Permutations II', url: 'https://leetcode.com/problems/permutations-ii/', difficulty: 'Medium' },
      { name: 'Generate Parentheses', url: 'https://leetcode.com/problems/generate-parentheses/', difficulty: 'Medium' },
      { name: 'Word Search', url: 'https://leetcode.com/problems/word-search/', difficulty: 'Medium' },
      { name: 'Palindrome Partitioning', url: 'https://leetcode.com/problems/palindrome-partitioning/', difficulty: 'Medium' },
      { name: 'N-Queens', url: 'https://leetcode.com/problems/n-queens/', difficulty: 'Hard' },
      { name: 'Sudoku Solver', url: 'https://leetcode.com/problems/sudoku-solver/', difficulty: 'Hard' },
    ],
  },
  {
    id: 'monotonic-stack', title: 'Monotonic Stack', difficulty: 'Medium-Hard', color: 'orange',
    description: 'Maintain a stack where elements are always in increasing or decreasing order. Pop elements that violate the order — those are your answers.',
    whenToUse: 'Next greater/smaller element, histogram problems, stock span, temperature problems.',
    problems: [
      { name: 'Next Greater Element II', url: 'https://leetcode.com/problems/next-greater-element-ii/', difficulty: 'Medium' },
      { name: 'Daily Temperatures', url: 'https://leetcode.com/problems/daily-temperatures/', difficulty: 'Medium' },
      { name: 'Online Stock Span', url: 'https://leetcode.com/problems/online-stock-span/', difficulty: 'Medium' },
      { name: 'Maximum Width Ramp', url: 'https://leetcode.com/problems/maximum-width-ramp/', difficulty: 'Medium' },
      { name: 'Largest Rectangle in Histogram', url: 'https://leetcode.com/problems/largest-rectangle-in-histogram/', difficulty: 'Hard' },
    ],
  },
  {
    id: 'trees', title: 'Trees', difficulty: 'Medium-Hard', color: 'cyan',
    description: 'Binary trees, BSTs, and N-ary trees. Most tree problems use DFS (recursion) or BFS (level-order).',
    whenToUse: 'Tree traversal, construction, path problems, ancestor problems, BST operations.',
    subcategories: [
      { name: 'Height & Depth', problems: [
        { name: 'Maximum Depth of Binary Tree', url: 'https://leetcode.com/problems/maximum-depth-of-binary-tree/', difficulty: 'Easy' },
        { name: 'Balanced Binary Tree', url: 'https://leetcode.com/problems/balanced-binary-tree/', difficulty: 'Easy' },
        { name: 'Diameter of Binary Tree', url: 'https://leetcode.com/problems/diameter-of-binary-tree/', difficulty: 'Easy' },
      ]},
      { name: 'Root to Leaf Path', problems: [
        { name: 'Binary Tree Paths', url: 'https://leetcode.com/problems/binary-tree-paths/', difficulty: 'Easy' },
        { name: 'Path Sum II', url: 'https://leetcode.com/problems/path-sum-ii/', difficulty: 'Medium' },
        { name: 'Binary Tree Maximum Path Sum', url: 'https://leetcode.com/problems/binary-tree-maximum-path-sum/', difficulty: 'Hard' },
      ]},
      { name: 'Level Order Traversal', problems: [
        { name: 'Binary Tree Level Order Traversal', url: 'https://leetcode.com/problems/binary-tree-level-order-traversal/', difficulty: 'Medium' },
        { name: 'Zigzag Level Order Traversal', url: 'https://leetcode.com/problems/binary-tree-zigzag-level-order-traversal/', difficulty: 'Medium' },
        { name: 'Maximum Width of Binary Tree', url: 'https://leetcode.com/problems/maximum-width-of-binary-tree/', difficulty: 'Medium' },
        { name: 'All Nodes Distance K in Binary Tree', url: 'https://leetcode.com/problems/all-nodes-distance-k-in-binary-tree/', difficulty: 'Medium' },
      ]},
      { name: 'Tree Construction', problems: [
        { name: 'Maximum Binary Tree', url: 'https://leetcode.com/problems/maximum-binary-tree/', difficulty: 'Medium' },
        { name: 'Construct BT from Preorder and Inorder', url: 'https://leetcode.com/problems/construct-binary-tree-from-preorder-and-inorder-traversal/', difficulty: 'Medium' },
        { name: 'Construct BST from Preorder', url: 'https://leetcode.com/problems/construct-binary-search-tree-from-preorder-traversal/', difficulty: 'Medium' },
      ]},
      { name: 'Ancestor Problems', problems: [
        { name: 'LCA of BST', url: 'https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-search-tree/', difficulty: 'Medium' },
        { name: 'LCA of Binary Tree', url: 'https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-tree/', difficulty: 'Medium' },
        { name: 'Max Difference Between Node and Ancestor', url: 'https://leetcode.com/problems/maximum-difference-between-node-and-ancestor/', difficulty: 'Medium' },
      ]},
      { name: 'Binary Search Tree', problems: [
        { name: 'Validate BST', url: 'https://leetcode.com/problems/validate-binary-search-tree/', difficulty: 'Medium' },
        { name: 'Insert into a BST', url: 'https://leetcode.com/problems/insert-into-a-binary-search-tree/', difficulty: 'Medium' },
      ]},
    ],
  },
  {
    id: 'dynamic-programming', title: 'Dynamic Programming', difficulty: 'Medium-Hard', color: 'blue',
    description: 'Break problems into overlapping subproblems. If you can define a recurrence relation, you can use DP.',
    whenToUse: 'Optimization problems (min/max), counting problems, problems with overlapping subproblems.',
    subcategories: [
      { name: 'Take / Not Take (0/1 Knapsack)', problems: [
        { name: 'House Robber II', url: 'https://leetcode.com/problems/house-robber-ii/', difficulty: 'Medium' },
        { name: 'Target Sum', url: 'https://leetcode.com/problems/target-sum/', difficulty: 'Medium' },
        { name: 'Partition Equal Subset Sum', url: 'https://leetcode.com/problems/partition-equal-subset-sum/', difficulty: 'Medium' },
        { name: 'Last Stone Weight II', url: 'https://leetcode.com/problems/last-stone-weight-ii/', difficulty: 'Medium' },
      ]},
      { name: 'Infinite Supply', problems: [
        { name: 'Coin Change', url: 'https://leetcode.com/problems/coin-change/', difficulty: 'Medium' },
        { name: 'Coin Change II', url: 'https://leetcode.com/problems/coin-change-ii/', difficulty: 'Medium' },
        { name: 'Perfect Squares', url: 'https://leetcode.com/problems/perfect-squares/', difficulty: 'Medium' },
        { name: 'Minimum Cost For Tickets', url: 'https://leetcode.com/problems/minimum-cost-for-tickets/', difficulty: 'Medium' },
      ]},
      { name: 'Longest Increasing Subsequence', problems: [
        { name: 'Longest Increasing Subsequence', url: 'https://leetcode.com/problems/longest-increasing-subsequence/', difficulty: 'Medium' },
        { name: 'Largest Divisible Subset', url: 'https://leetcode.com/problems/largest-divisible-subset/', difficulty: 'Medium' },
        { name: 'Number of LIS', url: 'https://leetcode.com/problems/number-of-longest-increasing-subsequence/', difficulty: 'Medium' },
        { name: 'Longest String Chain', url: 'https://leetcode.com/problems/longest-string-chain/', difficulty: 'Medium' },
      ]},
      { name: 'DP on Grids', problems: [
        { name: 'Unique Paths II', url: 'https://leetcode.com/problems/unique-paths-ii/', difficulty: 'Medium' },
        { name: 'Minimum Path Sum', url: 'https://leetcode.com/problems/minimum-path-sum/', difficulty: 'Medium' },
        { name: 'Maximal Square', url: 'https://leetcode.com/problems/maximal-square/', difficulty: 'Medium' },
        { name: 'Dungeon Game', url: 'https://leetcode.com/problems/dungeon-game/', difficulty: 'Hard' },
      ]},
      { name: 'DP on Strings', problems: [
        { name: 'Longest Common Subsequence', url: 'https://leetcode.com/problems/longest-common-subsequence/', difficulty: 'Medium' },
        { name: 'Longest Palindromic Subsequence', url: 'https://leetcode.com/problems/longest-palindromic-subsequence/', difficulty: 'Medium' },
        { name: 'Edit Distance', url: 'https://leetcode.com/problems/edit-distance/', difficulty: 'Medium' },
        { name: 'Wildcard Matching', url: 'https://leetcode.com/problems/wildcard-matching/', difficulty: 'Hard' },
      ]},
      { name: 'DP on Stocks', problems: [
        { name: 'Buy and Sell Stocks II', url: 'https://leetcode.com/problems/best-time-to-buy-and-sell-stock-ii/', difficulty: 'Medium' },
        { name: 'Buy and Sell Stocks with Cooldown', url: 'https://leetcode.com/problems/best-time-to-buy-and-sell-stock-with-cooldown/', difficulty: 'Medium' },
        { name: 'Buy and Sell Stocks with Transaction Fee', url: 'https://leetcode.com/problems/best-time-to-buy-and-sell-stock-with-transaction-fee/', difficulty: 'Medium' },
        { name: 'Buy and Sell Stocks III', url: 'https://leetcode.com/problems/best-time-to-buy-and-sell-stock-iii/', difficulty: 'Hard' },
      ]},
    ],
  },
  {
    id: 'graphs', title: 'Graphs', difficulty: 'Medium-Hard', color: 'green',
    description: 'Represent relationships between entities. Key algorithms: BFS, DFS, topological sort, union-find.',
    whenToUse: 'Dependency ordering, connected components, shortest paths, cycle detection, network problems.',
    subcategories: [
      { name: 'Topological Sort', problems: [
        { name: 'Course Schedule', url: 'https://leetcode.com/problems/course-schedule/', difficulty: 'Medium' },
        { name: 'Course Schedule II', url: 'https://leetcode.com/problems/course-schedule-ii/', difficulty: 'Medium' },
        { name: 'Alien Dictionary', url: 'https://leetcode.com/problems/alien-dictionary/', difficulty: 'Hard' },
      ]},
      { name: 'Union-Find', problems: [
        { name: 'Number of Operations to Make Network Connected', url: 'https://leetcode.com/problems/number-of-operations-to-make-network-connected/', difficulty: 'Medium' },
        { name: 'Redundant Connection', url: 'https://leetcode.com/problems/redundant-connection/', difficulty: 'Medium' },
        { name: 'Accounts Merge', url: 'https://leetcode.com/problems/accounts-merge/', difficulty: 'Medium' },
      ]},
    ],
  },
  {
    id: 'design', title: 'Design Data Structures', difficulty: 'Medium-Hard', color: 'purple',
    description: 'Implement custom data structures that support specific operations efficiently. Combine hash maps, linked lists, heaps.',
    whenToUse: 'LRU/LFU cache, Twitter feed, browser history, custom collections.',
    problems: [
      { name: 'Design Browser History', url: 'https://leetcode.com/problems/design-browser-history/', difficulty: 'Medium' },
      { name: 'Design Twitter', url: 'https://leetcode.com/problems/design-twitter/', difficulty: 'Medium' },
      { name: 'LRU Cache', url: 'https://leetcode.com/problems/lru-cache/', difficulty: 'Medium' },
      { name: 'Snapshot Array', url: 'https://leetcode.com/problems/snapshot-array/', difficulty: 'Medium' },
      { name: 'Design Circular Deque', url: 'https://leetcode.com/problems/design-circular-deque/', difficulty: 'Medium' },
      { name: 'LFU Cache', url: 'https://leetcode.com/problems/lfu-cache/', difficulty: 'Hard' },
    ],
  },

  // ── HARD ─────────────────────────────────────────────────────────────────
  {
    id: 'k-way-merge', title: 'K-way Merge', difficulty: 'Hard', color: 'red',
    description: 'Merge K sorted lists/arrays using a min-heap. Always pick the smallest element across all K lists.',
    whenToUse: 'Merging K sorted lists, finding K-th smallest across sorted arrays.',
    problems: [
      { name: 'Find K Pairs with Smallest Sums', url: 'https://leetcode.com/problems/find-k-pairs-with-smallest-sums/', difficulty: 'Medium' },
      { name: 'Kth Smallest Element in a Sorted Matrix', url: 'https://leetcode.com/problems/kth-smallest-element-in-a-sorted-matrix/', difficulty: 'Medium' },
      { name: 'Merge K Sorted Lists', url: 'https://leetcode.com/problems/merge-k-sorted-lists/', difficulty: 'Hard' },
      { name: 'Smallest Range Covering Elements from K Lists', url: 'https://leetcode.com/problems/smallest-range-covering-elements-from-k-lists/', difficulty: 'Hard' },
    ],
  },
  {
    id: 'two-heaps', title: 'Two Heaps', difficulty: 'Hard', color: 'orange',
    description: 'Use a max-heap for the smaller half and a min-heap for the larger half. The median is always at the top of one or both heaps.',
    whenToUse: 'Finding median in a stream, sliding window median, optimization with two competing priorities.',
    problems: [
      { name: 'Find Median from Data Stream', url: 'https://leetcode.com/problems/find-median-from-data-stream/', difficulty: 'Hard' },
      { name: 'Sliding Window Median', url: 'https://leetcode.com/problems/sliding-window-median/', difficulty: 'Hard' },
      { name: 'IPO', url: 'https://leetcode.com/problems/ipo/', difficulty: 'Hard' },
    ],
  },
];
