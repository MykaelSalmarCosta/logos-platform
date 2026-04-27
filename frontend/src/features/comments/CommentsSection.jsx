import { EmptyState } from "../../components/EmptyState";
import { formatDate } from "../../utils/format";

export function CommentsSection({
  post,
  comments,
  commentForm,
  isAuthenticated,
  isLoadingComments,
  isSubmittingComment,
  onChange,
  onSubmit,
  onLoginRequest,
}) {
  return (
    <section className="panel side-card comments-card">
      <div className="side-card__header">
        <h3>Comentarios</h3>
        <span className="comment-count">{comments.length}</span>
      </div>

      {!post ? (
        <EmptyState title="Nada aberto ainda" description="Escolha um post para acompanhar a conversa." />
      ) : (
        <>
          {isAuthenticated ? (
            <form className="comment-form" onSubmit={onSubmit}>
              <label className="field">
                <span>Responder</span>
                <textarea
                  rows="4"
                  maxLength="1600"
                  value={commentForm.content}
                  onChange={(event) =>
                    onChange((currentForm) => ({
                      ...currentForm,
                      content: event.target.value,
                    }))
                  }
                  placeholder="Escreva um comentario..."
                  required
                />
              </label>

              <button className="button button--primary" type="submit" disabled={isSubmittingComment}>
                {isSubmittingComment ? "Enviando..." : "Comentar"}
              </button>
            </form>
          ) : (
            <div className="comment-login">
              <p>Entre para participar da conversa.</p>
              <button className="button button--secondary" type="button" onClick={onLoginRequest}>
                Entrar
              </button>
            </div>
          )}

          <div className="comments-list">
            {isLoadingComments ? (
              Array.from({ length: 3 }).map((_, index) => (
                <div className="comment-item comment-item--skeleton" key={index}>
                  <div className="skeleton-line skeleton-line--short" />
                  <div className="skeleton-line" />
                </div>
              ))
            ) : comments.length ? (
              comments.map((comment) => <CommentItem comment={comment} key={comment.id} />)
            ) : (
              <EmptyState
                title="Ainda sem comentarios"
                description="Se a conversa te chamou, puxa o primeiro fio."
              />
            )}
          </div>
        </>
      )}
    </section>
  );
}

function CommentItem({ comment }) {
  return (
    <article className="comment-item">
      <div className="comment-item__meta">
        <strong>{comment.author}</strong>
        <span>{formatDate(comment.createdAt)}</span>
      </div>
      <p>{comment.content}</p>
    </article>
  );
}
