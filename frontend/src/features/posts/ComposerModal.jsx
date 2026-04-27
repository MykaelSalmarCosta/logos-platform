import { EmptyState } from "../../components/EmptyState";
import { topicOptions } from "../../constants/topics";

export function ComposerModal({
  editorMode,
  postForm,
  isAuthenticated,
  isSubmittingPost,
  onClose,
  onChange,
  onSubmit,
  onReset,
}) {
  return (
    <div
      className="modal-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <section className="composer-modal" role="dialog" aria-modal="true" aria-labelledby="composer-title">
        <div className="auth-modal__header">
          <h2 id="composer-title">{editorMode === "edit" ? "Editar post" : "Criar post"}</h2>
          <button className="modal-close" type="button" aria-label="Fechar" onClick={onClose}>
            X
          </button>
        </div>
        <ComposerForm
          editorMode={editorMode}
          postForm={postForm}
          isAuthenticated={isAuthenticated}
          isSubmittingPost={isSubmittingPost}
          onChange={onChange}
          onSubmit={onSubmit}
          onReset={onReset}
        />
      </section>
    </div>
  );
}

function ComposerForm({
  editorMode,
  postForm,
  isAuthenticated,
  isSubmittingPost,
  onChange,
  onSubmit,
  onReset,
}) {
  return (
    <section className="composer-card" id="composer-panel">
      {isAuthenticated ? (
        <form className="form-stack" onSubmit={onSubmit}>
          <label className="field">
            <span>Titulo</span>
            <input
              type="text"
              maxLength="120"
              value={postForm.title}
              onChange={(event) =>
                onChange((currentForm) => ({
                  ...currentForm,
                  title: event.target.value,
                }))
              }
              required
            />
          </label>

          <label className="field">
            <span>Tema</span>
            <select
              value={postForm.tema}
              onChange={(event) =>
                onChange((currentForm) => ({
                  ...currentForm,
                  tema: event.target.value,
                }))
              }
            >
              {topicOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>Conteudo</span>
            <textarea
              rows="6"
              minLength="10"
              maxLength="4000"
              value={postForm.content}
              onChange={(event) =>
                onChange((currentForm) => ({
                  ...currentForm,
                  content: event.target.value,
                }))
              }
              required
            />
          </label>

          <div className="button-row">
            <button className="button button--primary" type="submit" disabled={isSubmittingPost}>
              {isSubmittingPost
                ? "Salvando..."
                : editorMode === "edit"
                ? "Salvar alteracoes"
                : "Publicar"}
            </button>
            <button className="button button--ghost" type="button" onClick={onReset}>
              Limpar
            </button>
          </div>
        </form>
      ) : (
        <EmptyState title="Entre para publicar" description="Use o botao Entrar no topo." />
      )}
    </section>
  );
}
