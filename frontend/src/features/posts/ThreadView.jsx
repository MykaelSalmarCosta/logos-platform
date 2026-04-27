import { EmptyState } from "../../components/EmptyState";
import { topicLabels } from "../../constants/topics";
import { formatDate } from "../../utils/format";
import { getPostTopic } from "../../utils/posts";

export function ThreadView({ post, isAuthenticated, canManage, onBack, onEdit, onClose }) {
  const postTopic = post ? getPostTopic(post) : "";
  const topicLabel = topicLabels[postTopic] || postTopic;

  return (
    <section className="panel side-card side-card--detail thread-card">
      <div className="thread-header">
        <button className="back-button" type="button" onClick={onBack} aria-label="Voltar para o feed">
          Voltar
        </button>
        <div>
          <p>{post ? topicLabel : "Post"}</p>
          <h3>{post ? post.author : "Escolha um post"}</h3>
        </div>
      </div>

      {post ? (
        <>
          <h4 className="detail-title">{post.title}</h4>
          <p className="detail-author">
            por <strong>{post.author}</strong> em {formatDate(post.createdAt)} - {topicLabel}
          </p>
          <p className="detail-content">{post.content}</p>

          {isAuthenticated && canManage ? (
            <div className="button-row">
              <button className="button button--secondary" type="button" onClick={() => onEdit(post)}>
                Editar
              </button>
              <button
                className="button button--ghost"
                type="button"
                onClick={onClose}
                disabled={post.status === "FECHADO"}
              >
                {post.status === "FECHADO" ? "Ja fechado" : "Fechar post"}
              </button>
            </div>
          ) : null}
        </>
      ) : (
        <EmptyState
          title="Sem post selecionado"
          description="Clique em um card do feed para ler com mais calma aqui."
        />
      )}
    </section>
  );
}
