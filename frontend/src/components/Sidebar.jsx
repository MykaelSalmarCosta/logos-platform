export function Sidebar({
  topicOptions,
  topicFilter,
  statusFilter,
  onHome,
  onPopular,
  onExplore,
  onCreatePost,
  onTopicSelect,
}) {
  return (
    <aside className="left-rail">
      <nav className="rail-nav" aria-label="Navegacao principal">
        <button
          className={`rail-link ${topicFilter === "ALL" && statusFilter === "ALL" ? "rail-link--active" : ""}`}
          type="button"
          onClick={onHome}
        >
          <span className="rail-icon">H</span>
          Inicio
        </button>
        <button
          className={`rail-link ${statusFilter === "ABERTO" ? "rail-link--active" : ""}`}
          type="button"
          onClick={onPopular}
        >
          <span className="rail-icon">P</span>
          Populares
        </button>
        <button className="rail-link" type="button" onClick={onExplore}>
          <span className="rail-icon">E</span>
          Explorar
        </button>
        <button className="rail-link" type="button" onClick={onCreatePost}>
          <span className="rail-icon">+</span>
          Criar post
        </button>
      </nav>

      <div className="rail-section">
        <p className="rail-label">Temas</p>
        <nav className="topic-nav" aria-label="Temas">
          <button
            className={`topic-link ${topicFilter === "ALL" ? "topic-link--active" : ""}`}
            type="button"
            onClick={() => onTopicSelect("ALL")}
          >
            <span className="topic-icon">#</span>
            Todos os temas
          </button>
          {topicOptions.map((topic) => (
            <button
              className={`topic-link ${topicFilter === topic.value ? "topic-link--active" : ""}`}
              key={topic.value}
              type="button"
              onClick={() => onTopicSelect(topic.value)}
            >
              <span className="topic-icon">{topic.icon}</span>
              {topic.label}
            </button>
          ))}
        </nav>
      </div>
    </aside>
  );
}
