import { legacyTopicMap, legacyTopicValues } from "../constants/topics";

export function getPostTopic(post) {
  return normalizeTopicValue(post.tema || post.curso || "");
}

export function normalizeTopicValue(value) {
  return legacyTopicMap[value] || value;
}

export function buildPostPayload(postForm) {
  return {
    title: postForm.title,
    content: postForm.content,
    tema: postForm.tema,
    curso: legacyTopicValues[postForm.tema] || postForm.tema,
  };
}
