const codes = [
  {
    level: 1,
    path: "codes/level1.py",
    broken: `for a in range(5):
    prnt(a)`,
    output: "",
  },
  {
    level: 2,
    path: "codes/level2.py",
    broken: `def sum_of_squares(n):
  for i in range(1, n):
    total += i * i
  return total
# Fix the function to print 55
print(sum_of_squares(5))
    `,
    output: "",
  },
  {
    level: 3,
    path: "codes/level3.py",
    broken: "print('1s)",
    output: "",
  },
  {
    level: 4,
    path: "codes/level4.py",
    broken: "prit(1s)",
    output: "",
  },
  {
    level: 5,
    path: "codes/level5.py",
    broken: "print(5s)",
    output: "",
  },
];

module.exports = { codes };
