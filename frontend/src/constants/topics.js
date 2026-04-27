export const topicOptions = [
  { value: "TECNOLOGIA", label: "Tecnologia", icon: "T" },
  { value: "COTIDIANO", label: "Cotidiano", icon: "C" },
  { value: "LIVROS", label: "Livros", icon: "L" },
  { value: "SOCIEDADE", label: "Sociedade", icon: "S" },
  { value: "IDEIAS", label: "Ideias", icon: "I" },
  { value: "TRABALHO", label: "Trabalho", icon: "W" },
  { value: "CULTURA", label: "Cultura", icon: "A" },
];

export const topicLabels = Object.fromEntries(
  topicOptions.map((option) => [option.value, option.label])
);

export const legacyTopicMap = {
  JAVA: "TECNOLOGIA",
  SPRING_BOOT: "COTIDIANO",
  MYSQL: "LIVROS",
  SEGURANCA: "SOCIEDADE",
  API_REST: "IDEIAS",
  DEVOPS: "TRABALHO",
  FRONTEND: "CULTURA",
};

export const legacyTopicValues = Object.fromEntries(
  Object.entries(legacyTopicMap).map(([legacyValue, topicValue]) => [topicValue, legacyValue])
);
