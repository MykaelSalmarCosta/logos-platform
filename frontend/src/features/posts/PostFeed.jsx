import { EmptyState } from "../../components/EmptyState";
import { topicLabels } from "../../constants/topics";
import { formatDate, truncate } from "../../utils/format";
import { getPostTopic } from "../../utils/posts";

export function PostFeed({
  posts,
  page,
  totalPages,
  profile,
  isLoadingPosts,
  onOpenPost,
  onPreviousPage,
  onNextPage,
}) {
  return (
    <section className="panel section-card">
      <div className="section-card__header">
        <div>
          <h3>Feed</h3>
        </div>
      </div>

      {isLoadingPosts ? (
        <div className="posts-grid">
          {Array.from({ length: 6 }).map((_, index) => (
            <div className="post-card post-card--skeleton" key={index}>
              <div className="skeleton-line skeleton-line--short" />
              <div className="skeleton-line" />
              <div className="skeleton-line" />
            </div>
          ))}
        </div>
      ) : posts.length ? (
        <div className="posts-grid">
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              isOwner={profile?.username === post.author}
              onSelect={() => onOpenPost(post)}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          title="Nenhum post encontrado"
          description="Tente mudar os filtros ou publicar uma nova discussao."
        />
      )}

      <div className="pagination">
        <button className="button button--ghost" type="button" onClick={onPreviousPage} disabled={page === 0}>
          Pagina anterior
        </button>
        <span>
          Pagina {page + 1} de {totalPages}
        </span>
        <button
          className="button button--ghost"
          type="button"
          onClick={onNextPage}
          disabled={page + 1 >= totalPages}
        >
          Proxima pagina
        </button>
      </div>
    </section>
  );
}

function PostCard({ post, isOwner, onSelect }) {
  const postTopic = getPostTopic(post);
  const topicLabel = topicLabels[postTopic] || postTopic;

  return (
    <button type="button" className="post-card" onClick={onSelect}>
      <div className="post-card__meta post-card__meta--top">
        <span>{topicLabel}</span>
        <span>{post.author}</span>
        <span>{formatDate(post.createdAt)}</span>
      </div>

      <h4>{post.title}</h4>
      <p>{truncate(post.content, 140)}</p>

      <div className="post-actions">
        <span className="action-pill">Abrir conversa</span>
        <span className="action-pill">Comentarios</span>
        {isOwner ? <span>seu post</span> : null}
      </div>
    </button>
  );
}
