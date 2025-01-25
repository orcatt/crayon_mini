var bloodTypeInheritance = [
  {
    "parent1": "O",
    "parent2": "O",
    "possibleChildren": ["O"],
    "impossibleChildren": ["A", "B", "AB"]
  },
  {
    "parent1": "O",
    "parent2": "A",
    "possibleChildren": ["A", "O"],
    "impossibleChildren": ["B", "AB"]
  },
  {
    "parent1": "O",
    "parent2": "B",
    "possibleChildren": ["B", "O"],
    "impossibleChildren": ["A", "AB"]
  },
  {
    "parent1": "O",
    "parent2": "AB",
    "possibleChildren": ["A", "B"],
    "impossibleChildren": ["O", "AB"]
  },
  {
    "parent1": "A",
    "parent2": "A",
    "possibleChildren": ["A", "O"],
    "impossibleChildren": ["AB", "B"]
  },
  {
    "parent1": "A",
    "parent2": "B",
    "possibleChildren": ["A", "B", "AB", "O"],
    "impossibleChildren": []
  },
  {
    "parent1": "A",
    "parent2": "AB",
    "possibleChildren": ["A", "B", "AB"],
    "impossibleChildren": ["O"]
  },
  {
    "parent1": "B",
    "parent2": "B",
    "possibleChildren": ["B", "O"],
    "impossibleChildren": ["A", "AB"]
  },
  {
    "parent1": "B",
    "parent2": "AB",
    "possibleChildren": ["A", "B", "AB"],
    "impossibleChildren": ["O"]
  },
  {
    "parent1": "AB",
    "parent2": "AB",
    "possibleChildren": ["A", "B", "AB"],
    "impossibleChildren": ["O"]
  }
]

export default bloodTypeInheritance;
