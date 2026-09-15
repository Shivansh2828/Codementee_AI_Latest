"""
Seed DSA Practice Problems into MongoDB.
Each problem has: id, title, description, difficulty, category, input_format,
examples, starter_code (per language), test_cases, and display metadata.

Run: python3 seed_dsa_problems.py
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from pathlib import Path
import os
from datetime import datetime, timezone

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

MONGO_URL = os.environ.get("MONGO_URL")
DB_NAME = os.environ.get("DB_NAME", "codementee")

PROBLEMS = [
    {
        "problem_id": "pair-sum",
        "title": "Pair Sum",
        "difficulty": "Easy",
        "category": "Arrays & Hashing",
        "description": "Given an array of integers and a target sum, return the indices of two numbers that add up to the target. Each input has exactly one solution.",
        "input_format": "Line 1: comma-separated integers\nLine 2: target integer",
        "examples": [
            {"input": "nums = [2, 7, 11, 15], target = 9", "output": "[0, 1]", "explanation": "2 + 7 = 9"},
            {"input": "nums = [3, 3], target = 6", "output": "[0, 1]"},
        ],
        "starter_code": {
            "python": "def pair_sum(nums, target):\n    # Use a hash map for O(n) solution\n    pass\n\nnums = list(map(int, input().split(',')))\ntarget = int(input())\nresult = pair_sum(nums, target)\nprint(result)",
            "javascript": "function pairSum(nums, target) {\n    // Your code here\n}\nconst readline = require('readline');\nconst rl = readline.createInterface({input: process.stdin});\nconst lines = [];\nrl.on('line', l => lines.push(l));\nrl.on('close', () => {\n    const nums = lines[0].split(',').map(Number);\n    const target = Number(lines[1]);\n    console.log(JSON.stringify(pairSum(nums, target)));\n});",
        },
        "test_cases": [
            {"input": "2,7,11,15\n9", "expected_output": "[0, 1]"},
            {"input": "3,3\n6", "expected_output": "[0, 1]"},
            {"input": "1,4,5,8\n9", "expected_output": "[1, 2]"},
            {"input": "0,1,2,3,4\n6", "expected_output": "[2, 3]"},
        ],
        "display_order": 1,
        "is_active": True,
    },
    {
        "problem_id": "contains-repeat",
        "title": "Contains Repeat",
        "difficulty": "Easy",
        "category": "Arrays & Hashing",
        "description": "Given an integer array, return true if any value appears at least twice, false if every element is distinct.",
        "input_format": "Line 1: comma-separated integers",
        "examples": [
            {"input": "nums = [1, 2, 3, 1]", "output": "true"},
            {"input": "nums = [1, 2, 3, 4]", "output": "false"},
        ],
        "starter_code": {
            "python": "def contains_repeat(nums):\n    # Your code here\n    pass\n\nnums = list(map(int, input().split(',')))\nprint(str(contains_repeat(nums)).lower())",
            "javascript": "function containsRepeat(nums) {\n    // Your code here\n}\nconst readline = require('readline');\nconst rl = readline.createInterface({input: process.stdin});\nrl.on('line', l => {\n    const nums = l.split(',').map(Number);\n    console.log(containsRepeat(nums));\n    rl.close();\n});",
        },
        "test_cases": [
            {"input": "1,2,3,1", "expected_output": "true"},
            {"input": "1,2,3,4", "expected_output": "false"},
            {"input": "5,5", "expected_output": "true"},
            {"input": "1", "expected_output": "false"},
        ],
        "display_order": 2,
        "is_active": True,
    },
    {
        "problem_id": "max-profit",
        "title": "Maximum Profit",
        "difficulty": "Easy",
        "category": "Arrays & Hashing",
        "description": "You are given an array of prices where prices[i] is the price of a stock on day i. Find the maximum profit from buying on one day and selling on a later day. Return 0 if no profit is possible.",
        "input_format": "Line 1: comma-separated stock prices",
        "examples": [
            {"input": "prices = [7, 1, 5, 3, 6, 4]", "output": "5", "explanation": "Buy at 1, sell at 6"},
            {"input": "prices = [7, 6, 4, 3, 1]", "output": "0", "explanation": "No profitable trade"},
        ],
        "starter_code": {
            "python": "def max_profit(prices):\n    # Track min price so far and max profit\n    pass\n\nprices = list(map(int, input().split(',')))\nprint(max_profit(prices))",
            "javascript": "function maxProfit(prices) {\n    // Your code here\n}\nconst readline = require('readline');\nconst rl = readline.createInterface({input: process.stdin});\nrl.on('line', l => {\n    const prices = l.split(',').map(Number);\n    console.log(maxProfit(prices));\n    rl.close();\n});",
        },
        "test_cases": [
            {"input": "7,1,5,3,6,4", "expected_output": "5"},
            {"input": "7,6,4,3,1", "expected_output": "0"},
            {"input": "1,2", "expected_output": "1"},
            {"input": "2,4,1", "expected_output": "2"},
        ],
        "display_order": 3,
        "is_active": True,
    },
    {
        "problem_id": "longest-window-unique",
        "title": "Longest Substring Without Repeating Characters",
        "difficulty": "Medium",
        "category": "Sliding Window",
        "description": "Given a string, find the length of the longest substring that contains no repeating characters.",
        "input_format": "Line 1: a string",
        "examples": [
            {"input": "s = 'abcabcbb'", "output": "3", "explanation": "'abc' has length 3"},
            {"input": "s = 'bbbbb'", "output": "1"},
        ],
        "starter_code": {
            "python": "def longest_unique(s):\n    # Use sliding window with a set\n    pass\n\ns = input()\nprint(longest_unique(s))",
            "javascript": "function longestUnique(s) {\n    // Your code here\n}\nconst readline = require('readline');\nconst rl = readline.createInterface({input: process.stdin});\nrl.on('line', l => {\n    console.log(longestUnique(l));\n    rl.close();\n});",
        },
        "test_cases": [
            {"input": "abcabcbb", "expected_output": "3"},
            {"input": "bbbbb", "expected_output": "1"},
            {"input": "pwwkew", "expected_output": "3"},
            {"input": "a", "expected_output": "1"},
            {"input": "", "expected_output": "0"},
        ],
        "display_order": 4,
        "is_active": True,
    },
    {
        "problem_id": "max-sum-subarray-k",
        "title": "Maximum Sum Subarray of Size K",
        "difficulty": "Easy",
        "category": "Sliding Window",
        "description": "Given an array of integers and a number k, find the maximum sum of any contiguous subarray of size k.",
        "input_format": "Line 1: comma-separated integers\nLine 2: integer k",
        "examples": [
            {"input": "nums = [2, 1, 5, 1, 3, 2], k = 3", "output": "9", "explanation": "Subarray [5, 1, 3]"},
        ],
        "starter_code": {
            "python": "def max_sum_subarray(nums, k):\n    # Use sliding window of size k\n    pass\n\nnums = list(map(int, input().split(',')))\nk = int(input())\nprint(max_sum_subarray(nums, k))",
            "javascript": "function maxSumSubarray(nums, k) {\n    // Your code here\n}\nconst readline = require('readline');\nconst rl = readline.createInterface({input: process.stdin});\nconst lines = [];\nrl.on('line', l => lines.push(l));\nrl.on('close', () => {\n    const nums = lines[0].split(',').map(Number);\n    const k = Number(lines[1]);\n    console.log(maxSumSubarray(nums, k));\n});",
        },
        "test_cases": [
            {"input": "2,1,5,1,3,2\n3", "expected_output": "9"},
            {"input": "1,2,3,4,5\n2", "expected_output": "9"},
            {"input": "5,5,5,5\n1", "expected_output": "5"},
            {"input": "1,9,2,8,3\n3", "expected_output": "13"},
        ],
        "display_order": 5,
        "is_active": True,
    },
    {
        "problem_id": "search-sorted",
        "title": "Search in Sorted Array",
        "difficulty": "Easy",
        "category": "Binary Search",
        "description": "Given a sorted array of integers and a target value, return the index of the target. If not found, return -1. You must write an O(log n) solution.",
        "input_format": "Line 1: comma-separated sorted integers\nLine 2: target integer",
        "examples": [
            {"input": "nums = [-1, 0, 3, 5, 9, 12], target = 9", "output": "4"},
            {"input": "nums = [-1, 0, 3, 5, 9, 12], target = 2", "output": "-1"},
        ],
        "starter_code": {
            "python": "def search_sorted(nums, target):\n    # Binary search: O(log n)\n    pass\n\nnums = list(map(int, input().split(',')))\ntarget = int(input())\nprint(search_sorted(nums, target))",
            "javascript": "function searchSorted(nums, target) {\n    // Binary search\n}\nconst readline = require('readline');\nconst rl = readline.createInterface({input: process.stdin});\nconst lines = [];\nrl.on('line', l => lines.push(l));\nrl.on('close', () => {\n    const nums = lines[0].split(',').map(Number);\n    const target = Number(lines[1]);\n    console.log(searchSorted(nums, target));\n});",
        },
        "test_cases": [
            {"input": "-1,0,3,5,9,12\n9", "expected_output": "4"},
            {"input": "-1,0,3,5,9,12\n2", "expected_output": "-1"},
            {"input": "5\n5", "expected_output": "0"},
            {"input": "1,3,5,7,9\n7", "expected_output": "3"},
        ],
        "display_order": 6,
        "is_active": True,
    },
    {
        "problem_id": "valid-brackets",
        "title": "Valid Brackets",
        "difficulty": "Easy",
        "category": "Stack",
        "description": "Given a string containing only '(', ')', '{', '}', '[', ']', determine if the input string has valid bracket ordering. Every open bracket must be closed by the same type in correct order.",
        "input_format": "Line 1: string of brackets",
        "examples": [
            {"input": "s = '()[]{}'", "output": "true"},
            {"input": "s = '(]'", "output": "false"},
        ],
        "starter_code": {
            "python": "def valid_brackets(s):\n    # Use a stack\n    pass\n\ns = input()\nprint(str(valid_brackets(s)).lower())",
            "javascript": "function validBrackets(s) {\n    // Use a stack\n}\nconst readline = require('readline');\nconst rl = readline.createInterface({input: process.stdin});\nrl.on('line', l => {\n    console.log(validBrackets(l));\n    rl.close();\n});",
        },
        "test_cases": [
            {"input": "()[]{}", "expected_output": "true"},
            {"input": "(]", "expected_output": "false"},
            {"input": "([{}])", "expected_output": "true"},
            {"input": "((", "expected_output": "false"},
            {"input": "", "expected_output": "true"},
        ],
        "display_order": 7,
        "is_active": True,
    },
    {
        "problem_id": "reverse-array",
        "title": "Reverse Array In-Place",
        "difficulty": "Easy",
        "category": "Two Pointers",
        "description": "Given an array of integers, reverse it in-place and return the reversed array.",
        "input_format": "Line 1: comma-separated integers",
        "examples": [
            {"input": "nums = [1, 2, 3, 4, 5]", "output": "[5, 4, 3, 2, 1]"},
        ],
        "starter_code": {
            "python": "def reverse_array(nums):\n    # Two pointers from both ends\n    pass\n\nnums = list(map(int, input().split(',')))\nresult = reverse_array(nums)\nprint(result)",
            "javascript": "function reverseArray(nums) {\n    // Two pointers\n}\nconst readline = require('readline');\nconst rl = readline.createInterface({input: process.stdin});\nrl.on('line', l => {\n    const nums = l.split(',').map(Number);\n    console.log(JSON.stringify(reverseArray(nums)));\n    rl.close();\n});",
        },
        "test_cases": [
            {"input": "1,2,3,4,5", "expected_output": "[5, 4, 3, 2, 1]"},
            {"input": "1,2", "expected_output": "[2, 1]"},
            {"input": "1", "expected_output": "[1]"},
            {"input": "3,7,1,9", "expected_output": "[9, 1, 7, 3]"},
        ],
        "display_order": 8,
        "is_active": True,
    },
    {
        "problem_id": "max-subarray-sum",
        "title": "Maximum Subarray Sum",
        "difficulty": "Medium",
        "category": "Dynamic Programming",
        "description": "Given an integer array, find the contiguous subarray with the largest sum and return that sum. The subarray must contain at least one element.",
        "input_format": "Line 1: comma-separated integers",
        "examples": [
            {"input": "nums = [-2, 1, -3, 4, -1, 2, 1, -5, 4]", "output": "6", "explanation": "Subarray [4, -1, 2, 1] has sum 6"},
        ],
        "starter_code": {
            "python": "def max_subarray_sum(nums):\n    # Kadane's algorithm\n    pass\n\nnums = list(map(int, input().split(',')))\nprint(max_subarray_sum(nums))",
            "javascript": "function maxSubarraySum(nums) {\n    // Kadane's algorithm\n}\nconst readline = require('readline');\nconst rl = readline.createInterface({input: process.stdin});\nrl.on('line', l => {\n    const nums = l.split(',').map(Number);\n    console.log(maxSubarraySum(nums));\n    rl.close();\n});",
        },
        "test_cases": [
            {"input": "-2,1,-3,4,-1,2,1,-5,4", "expected_output": "6"},
            {"input": "1", "expected_output": "1"},
            {"input": "5,4,-1,7,8", "expected_output": "23"},
            {"input": "-1,-2,-3", "expected_output": "-1"},
        ],
        "display_order": 9,
        "is_active": True,
    },
    {
        "problem_id": "climb-stairs",
        "title": "Climb Stairs",
        "difficulty": "Easy",
        "category": "Dynamic Programming",
        "description": "You are climbing a staircase with n steps. Each time you can climb 1 or 2 steps. How many distinct ways can you reach the top?",
        "input_format": "Line 1: integer n (number of steps)",
        "examples": [
            {"input": "n = 2", "output": "2", "explanation": "1+1 or 2"},
            {"input": "n = 3", "output": "3", "explanation": "1+1+1, 1+2, 2+1"},
        ],
        "starter_code": {
            "python": "def climb_stairs(n):\n    # DP: ways[i] = ways[i-1] + ways[i-2]\n    pass\n\nn = int(input())\nprint(climb_stairs(n))",
            "javascript": "function climbStairs(n) {\n    // Your code here\n}\nconst readline = require('readline');\nconst rl = readline.createInterface({input: process.stdin});\nrl.on('line', l => {\n    console.log(climbStairs(Number(l)));\n    rl.close();\n});",
        },
        "test_cases": [
            {"input": "2", "expected_output": "2"},
            {"input": "3", "expected_output": "3"},
            {"input": "5", "expected_output": "8"},
            {"input": "1", "expected_output": "1"},
            {"input": "10", "expected_output": "89"},
        ],
        "display_order": 10,
        "is_active": True,
    },
]


async def seed_problems():
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]

    for problem in PROBLEMS:
        problem["created_at"] = datetime.now(timezone.utc).isoformat()
        problem["updated_at"] = datetime.now(timezone.utc).isoformat()

        existing = await db.dsa_problems.find_one({"problem_id": problem["problem_id"]})
        if existing:
            await db.dsa_problems.update_one(
                {"problem_id": problem["problem_id"]},
                {"$set": problem}
            )
            print(f"✓ Updated: {problem['problem_id']}")
        else:
            await db.dsa_problems.insert_one(problem)
            print(f"✓ Created: {problem['problem_id']}")

    print(f"\n✅ Done. {len(PROBLEMS)} problems seeded.")
    print("📌 Add more via Admin Dashboard → DSA Problems")
    client.close()


if __name__ == "__main__":
    asyncio.run(seed_problems())
