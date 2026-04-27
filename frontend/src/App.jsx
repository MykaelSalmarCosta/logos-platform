import { useDeferredValue, useEffect, useState } from "react";

const TOKEN_STORAGE_KEY = "logos_token";
const API_URL = normalizeApiUrl(import.meta.env.VITE_API_URL || "http://localhost:8080");

const topicOptions = [
  { value: "TECNOLOGIA", label: "Tecnologia", icon: "T" },
  { value: "COTIDIANO", label: "Cotidiano", icon: "C" },
  { value: "LIVROS", label: "Livros", icon: "L" },
  { value: "SOCIEDADE", label: "Sociedade", icon: "S" },
  { value: "IDEIAS", label: "Ideias", icon: "I" },
  { value: "TRABALHO", label: "Trabalho", icon: "W" },
  { value: "CULTURA", label: "Cultura", icon: "A" },
];

const topicLabels = Object.fromEntries(topicOptions.map((option) => [option.value, option.label]));
const legacyTopicMap = {
  JAVA: "TECNOLOGIA",
  SPRING_BOOT: "COTIDIANO",
  MYSQL: "LIVROS",
  SEGURANCA: "SOCIEDADE",
  API_REST: "IDEIAS",
  DEVOPS: "TRABALHO",
  FRONTEND: "CULTURA",
};
const legacyTopicValues = Object.fromEntries(
  Object.entries(legacyTopicMap).map(([legacyValue, topicValue]) => [topicValue, legacyValue])
);
const initialLoginForm = {
  email: "",
  password: "",
};

const initialRegisterForm = {
  username: "",
  email: "",
  password: "",
};

const initialPostForm = {
  title: "",
  content: "",
  tema: "TECNOLOGIA",
};

const initialCommentForm = {
  content: "",
};

class ApiClientError extends Error {
  constructor(message, status, payload) {
    super(message);
    this.name = "ApiClientError";
    this.status = status;
    this.payload = payload;
  }
}

export default function App() {
  const [token, setToken] = useState(() => window.localStorage.getItem(TOKEN_STORAGE_KEY) || "");
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [activePost, setActivePost] = useState(null);
  const [authMode, setAuthMode] = useState("login");
  const [loginForm, setLoginForm] = useState(initialLoginForm);
  const [registerForm, setRegisterForm] = useState(initialRegisterForm);
  const [postForm, setPostForm] = useState(initialPostForm);
  const [commentForm, setCommentForm] = useState(initialCommentForm);
  const [comments, setComments] = useState([]);
  const [editorMode, setEditorMode] = useState("create");
  const [, setMessage] = useState(null);
  const [search, setSearch] = useState("");
  const [topicFilter, setTopicFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [isAuthPanelOpen, setIsAuthPanelOpen] = useState(false);
  const [isLoadingPosts, setIsLoadingPosts] = useState(true);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [isSubmittingAuth, setIsSubmittingAuth] = useState(false);
  const [isSubmittingPost, setIsSubmittingPost] = useState(false);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  const deferredSearch = useDeferredValue(search);

  useEffect(() => {
    void loadPosts(page);
  }, [page]);

  useEffect(() => {
    if (!token) {
      window.localStorage.removeItem(TOKEN_STORAGE_KEY);
      setProfile(null);
      return;
    }

    window.localStorage.setItem(TOKEN_STORAGE_KEY, token);
    void loadProfile(token);
  }, [token]);

  useEffect(() => {
    if (!posts.length) {
      setActivePost(null);
      return;
    }

    if (!activePost) {
      setActivePost(posts[0]);
      return;
    }

    const refreshedPost = posts.find((post) => post.id === activePost.id);

    if (refreshedPost) {
      setActivePost(refreshedPost);
    }
  }, [posts, activePost]);

  useEffect(() => {
    const postId = activePost?.id;

    if (!postId) {
      setComments([]);
      return;
    }

    void loadComments(postId);
  }, [activePost?.id]);

  useEffect(() => {
    if (!isAuthPanelOpen) {
      return undefined;
    }

    function handleEscape(event) {
      if (event.key === "Escape") {
        setIsAuthPanelOpen(false);
      }
    }

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isAuthPanelOpen]);

  const visiblePosts = posts.filter((post) => {
    const normalizedSearch = deferredSearch.trim().toLowerCase();
    const postTopic = getPostTopic(post);
    const matchesSearch =
      !normalizedSearch ||
      [post.title, post.content, post.author, topicLabels[postTopic] || postTopic]
        .join(" ")
        .toLowerCase()
        .includes(normalizedSearch);

    const matchesTopic = topicFilter === "ALL" || postTopic === topicFilter;
    const matchesStatus = statusFilter === "ALL" || post.status === statusFilter;

    return matchesSearch && matchesTopic && matchesStatus;
  });

  const canManageActivePost =
    Boolean(profile) && Boolean(activePost) && profile.username === activePost.author;

  async function loadPosts(targetPage) {
    setIsLoadingPosts(true);

    try {
      const response = await apiRequest(`/posts?page=${targetPage}&size=12`);

      setPosts(response.content || []);
      setTotalPages(Math.max(response.totalPages || 1, 1));
    } catch (error) {
      setMessage({
        type: "error",
        text: error.message || "Nao foi possivel carregar os posts.",
      });
    } finally {
      setIsLoadingPosts(false);
    }
  }

  async function loadProfile(currentToken) {
    try {
      const response = await apiRequest("/users/me", { token: currentToken });
      setProfile(response);
    } catch (error) {
      if (error instanceof ApiClientError && (error.status === 401 || error.status === 403)) {
        logout("Sua sessao expirou. Faça login novamente.");
      } else {
        setMessage({
          type: "error",
          text: error.message || "Nao foi possivel carregar a sessao atual.",
        });
      }
    }
  }

  async function refreshPost(postId) {
    try {
      const response = await apiRequest(`/posts/${postId}`);
      setActivePost(response);
      setPosts((currentPosts) =>
        currentPosts.map((post) => (post.id === response.id ? response : post))
      );
    } catch (error) {
      setMessage({
        type: "error",
        text: error.message || "Nao foi possivel atualizar o post selecionado.",
      });
    }
  }

  async function loadComments(postId) {
    setIsLoadingComments(true);

    try {
      const response = await apiRequest(`/posts/${postId}/comments`);
      setComments(response || []);
    } catch (error) {
      setComments([]);
      setMessage({
        type: "error",
        text: error.message || "Nao foi possivel carregar os comentarios.",
      });
    } finally {
      setIsLoadingComments(false);
    }
  }

  function logout(customMessage = "Sessao encerrada.") {
    setToken("");
    setProfile(null);
    setEditorMode("create");
    setPostForm(initialPostForm);
    setMessage({ type: "info", text: customMessage });
  }

  async function handleLogin(event) {
    event.preventDefault();
    setIsSubmittingAuth(true);

    try {
      const response = await apiRequest("/login", {
        method: "POST",
        body: loginForm,
      });

      setToken(response.token);
      setLoginForm(initialLoginForm);
      setIsAuthPanelOpen(false);
      setMessage({
        type: "success",
        text: "Login realizado.",
      });
    } catch (error) {
      setMessage({
        type: "error",
        text: error.message || "Nao foi possivel fazer login.",
      });
    } finally {
      setIsSubmittingAuth(false);
    }
  }

  async function handleRegister(event) {
    event.preventDefault();
    setIsSubmittingAuth(true);

    try {
      await apiRequest("/users", {
        method: "POST",
        body: registerForm,
      });

      const response = await apiRequest("/login", {
        method: "POST",
        body: {
          email: registerForm.email,
          password: registerForm.password,
        },
      });

      setToken(response.token);
      setRegisterForm(initialRegisterForm);
      setIsAuthPanelOpen(false);
      setMessage({
        type: "success",
        text: "Conta criada com sucesso.",
      });
    } catch (error) {
      setMessage({
        type: "error",
        text: error.message || "Nao foi possivel concluir o cadastro.",
      });
    } finally {
      setIsSubmittingAuth(false);
    }
  }

  async function handlePostSubmit(event) {
    event.preventDefault();

    if (!token) {
      setMessage({
        type: "info",
        text: "Entre com sua conta para publicar no Logos.",
      });
      return;
    }

    setIsSubmittingPost(true);

    try {
      const endpoint =
        editorMode === "edit" && activePost ? `/posts/${activePost.id}` : "/posts";
      const method = editorMode === "edit" && activePost ? "PUT" : "POST";

      const response = await apiRequest(endpoint, {
        method,
        token,
        body: buildPostPayload(postForm),
      });

      setEditorMode("create");
      setPostForm(initialPostForm);
      setPage(0);
      await loadPosts(0);
      setActivePost(response);
      setMessage({
        type: "success",
        text:
          method === "POST"
            ? "Post publicado com sucesso."
            : "Post atualizado com sucesso.",
      });
    } catch (error) {
      if (error instanceof ApiClientError && error.status === 401) {
        logout("Sua sessao expirou. Faça login para continuar.");
      } else {
        setMessage({
          type: "error",
          text: error.message || "Nao foi possivel salvar o post.",
        });
      }
    } finally {
      setIsSubmittingPost(false);
    }
  }

  async function handleClosePost() {
    if (!activePost || !token) {
      return;
    }

    setIsSubmittingPost(true);

    try {
      await apiRequest(`/posts/${activePost.id}/close`, {
        method: "PATCH",
        token,
      });

      await loadPosts(page);
      await refreshPost(activePost.id);
      setMessage({
        type: "success",
        text: "Post fechado com sucesso.",
      });
    } catch (error) {
      if (error instanceof ApiClientError && error.status === 401) {
        logout("Sua sessao expirou. Faça login para continuar.");
      } else {
        setMessage({
          type: "error",
          text: error.message || "Nao foi possivel fechar esse post.",
        });
      }
    } finally {
      setIsSubmittingPost(false);
    }
  }

  async function handleCommentSubmit(event) {
    event.preventDefault();

    if (!activePost) {
      return;
    }

    if (!token) {
      setAuthMode("login");
      setIsAuthPanelOpen(true);
      setMessage({
        type: "info",
        text: "Entre com sua conta para comentar.",
      });
      return;
    }

    const content = commentForm.content.trim();

    if (!content) {
      return;
    }

    setIsSubmittingComment(true);

    try {
      const response = await apiRequest(`/posts/${activePost.id}/comments`, {
        method: "POST",
        token,
        body: { content },
      });

      setComments((currentComments) => [...currentComments, response]);
      setCommentForm(initialCommentForm);
      setMessage({
        type: "success",
        text: "Comentario publicado.",
      });
    } catch (error) {
      if (error instanceof ApiClientError && error.status === 401) {
        logout("Sua sessao expirou. Faça login para continuar.");
      } else {
        setMessage({
          type: "error",
          text: error.message || "Nao foi possivel publicar o comentario.",
        });
      }
    } finally {
      setIsSubmittingComment(false);
    }
  }

  function startEditing(post) {
    setActivePost(post);
    setEditorMode("edit");
    setPostForm({
      title: post.title,
      content: post.content,
      tema: getPostTopic(post),
    });
    setMessage({
      type: "info",
      text: "Modo edicao ativado para o post selecionado.",
    });
  }

  function resetComposer() {
    setEditorMode("create");
    setPostForm(initialPostForm);
  }

  function openComposer() {
    if (!profile) {
      openLoginModal();
      return;
    }

    resetComposer();
    window.setTimeout(() => {
      document.getElementById("composer-panel")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 0);
  }

  function openLoginModal() {
    setAuthMode("login");
    setIsAuthPanelOpen(true);
  }

  return (
    <div className="app-shell">
      <div className="background-grid" />

      <header className="topbar">
        <div className="brand-block">
          <LogoMark />
          <h1>Logos</h1>
        </div>

        <div className="topbar__actions">
          <label className="topbar-search" aria-label="Buscar no Logos">
            <span>Buscar</span>
            <input
              type="search"
              placeholder="Buscar no Logos"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </label>
          <button className="topbar-link" type="button" onClick={() => setPage(0)}>
            Feed
          </button>
          {profile ? (
            <>
              <button className="button button--primary button--small" type="button" onClick={openComposer}>
                Criar post
              </button>
              <span className="account-name">{profile.username}</span>
              <button className="button button--ghost button--small" type="button" onClick={() => logout()}>
                Sair
              </button>
            </>
          ) : (
            <>
              <button
                className="button button--ghost button--small"
                type="button"
                onClick={() => {
                  setAuthMode("login");
                  setIsAuthPanelOpen(true);
                }}
              >
                Criar post
              </button>
              <button
                className="button button--ghost button--small"
                type="button"
                onClick={() => {
                  setAuthMode("login");
                  setIsAuthPanelOpen(true);
                }}
              >
                Entrar
              </button>
              <button
                className="button button--primary button--small"
                type="button"
                onClick={() => {
                  setAuthMode("register");
                  setIsAuthPanelOpen(true);
                }}
              >
                Criar conta
              </button>
            </>
          )}
        </div>

      </header>

      <main className="layout">
        <section className="overview-bar">
          <div>
            <h2>Discussões recentes</h2>
            <p>Escolha um tema, leia com calma e entre na conversa.</p>
          </div>
        </section>

        <section className="social-layout">
          <aside className="left-rail">
            <nav className="rail-nav" aria-label="Navegacao principal">
              <button
                className={`rail-link ${
                  topicFilter === "ALL" && statusFilter === "ALL" ? "rail-link--active" : ""
                }`}
                type="button"
                onClick={() => {
                  setPage(0);
                  setStatusFilter("ALL");
                  setTopicFilter("ALL");
                }}
              >
                <span className="rail-icon">H</span>
                Inicio
              </button>
              <button
                className={`rail-link ${statusFilter === "ABERTO" ? "rail-link--active" : ""}`}
                type="button"
                onClick={() => {
                  setPage(0);
                  setStatusFilter("ABERTO");
                }}
              >
                <span className="rail-icon">P</span>
                Populares
              </button>
              <button
                className="rail-link"
                type="button"
                onClick={() => {
                  setStatusFilter("ALL");
                  setTopicFilter("ALL");
                }}
              >
                <span className="rail-icon">E</span>
                Explorar
              </button>
              <button className="rail-link" type="button" onClick={openComposer}>
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
                  onClick={() => setTopicFilter("ALL")}
                >
                  <span className="topic-icon">#</span>
                  Todos os temas
                </button>
                {topicOptions.map((topic) => (
                  <button
                    className={`topic-link ${topicFilter === topic.value ? "topic-link--active" : ""}`}
                    key={topic.value}
                    type="button"
                    onClick={() => setTopicFilter(topic.value)}
                  >
                    <span className="topic-icon">{topic.icon}</span>
                    {topic.label}
                  </button>
                ))}
              </nav>
            </div>

            <ComposerCard
              editorMode={editorMode}
              postForm={postForm}
              isAuthenticated={Boolean(profile)}
              isSubmittingPost={isSubmittingPost}
              onChange={setPostForm}
              onSubmit={handlePostSubmit}
              onReset={resetComposer}
            />
          </aside>

          <section className="main-column">
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
              ) : visiblePosts.length ? (
                <div className="posts-grid">
                  {visiblePosts.map((post) => (
                    <PostCard
                      key={post.id}
                      post={post}
                      isActive={activePost?.id === post.id}
                      isOwner={profile?.username === post.author}
                      onSelect={() => setActivePost(post)}
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
                <button
                  className="button button--ghost"
                  type="button"
                  onClick={() => setPage((currentPage) => Math.max(currentPage - 1, 0))}
                  disabled={page === 0}
                >
                  Pagina anterior
                </button>
                <span>
                  Pagina {page + 1} de {totalPages}
                </span>
                <button
                  className="button button--ghost"
                  type="button"
                  onClick={() =>
                    setPage((currentPage) =>
                      currentPage + 1 >= totalPages ? currentPage : currentPage + 1
                    )
                  }
                  disabled={page + 1 >= totalPages}
                >
                  Proxima pagina
                </button>
              </div>
            </section>

            <DetailCard
              post={activePost}
              isAuthenticated={Boolean(profile)}
              canManage={canManageActivePost}
              onEdit={startEditing}
              onClose={handleClosePost}
            />

            <CommentsCard
              post={activePost}
              comments={comments}
              commentForm={commentForm}
              isAuthenticated={Boolean(profile)}
              isLoadingComments={isLoadingComments}
              isSubmittingComment={isSubmittingComment}
              onChange={setCommentForm}
              onSubmit={handleCommentSubmit}
              onLoginRequest={openLoginModal}
            />
          </section>
        </section>
      </main>

      {!profile && isAuthPanelOpen ? (
        <div
          className="modal-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setIsAuthPanelOpen(false);
            }
          }}
        >
          <section className="auth-modal" role="dialog" aria-modal="true" aria-labelledby="auth-title">
            <div className="auth-modal__header">
              <h2 id="auth-title">{authMode === "login" ? "Entrar" : "Criar conta"}</h2>
              <button
                className="modal-close"
                type="button"
                aria-label="Fechar"
                onClick={() => setIsAuthPanelOpen(false)}
              >
                X
              </button>
            </div>
            <AuthCard
              authMode={authMode}
              loginForm={loginForm}
              registerForm={registerForm}
              isSubmittingAuth={isSubmittingAuth}
              onModeChange={setAuthMode}
              onLoginFormChange={setLoginForm}
              onRegisterFormChange={setRegisterForm}
              onLogin={handleLogin}
              onRegister={handleRegister}
            />
          </section>
        </div>
      ) : null}
    </div>
  );
}

function LogoMark() {
  return (
    <span className="brand-mark" aria-hidden="true">
      <svg viewBox="0 0 64 64" role="img">
        <path className="logo-line" d="M32 12v35" />
        <path className="logo-line" d="M22 18h20" />
        <path className="logo-line" d="M18 48h28" />
        <path className="logo-line" d="M26 18 15 34" />
        <path className="logo-line" d="M38 18 49 34" />
        <path className="logo-pan" d="M8 34h20c-1 6-4 10-10 10S9 40 8 34Z" />
        <path className="logo-pan" d="M36 34h20c-1 6-4 10-10 10s-9-4-10-10Z" />
        <path className="logo-book" d="M12 30c4-2 8-2 12 0v8c-4-2-8-2-12 0v-8Z" />
        <path className="logo-book" d="M24 30c-4-2-8-2-12 0v8c4-2 8-2 12 0v-8Z" />
        <circle className="logo-lens" cx="45" cy="34" r="4.5" />
        <path className="logo-lens" d="m48.5 37.5 4.5 4.5" />
      </svg>
    </span>
  );
}

function PostCard({ post, isActive, isOwner, onSelect }) {
  const postTopic = getPostTopic(post);
  const topicLabel = topicLabels[postTopic] || postTopic;

  return (
    <button
      type="button"
      className={`post-card ${isActive ? "post-card--active" : ""}`}
      onClick={onSelect}
    >
      <h4>{post.title}</h4>
      <p>{truncate(post.content, 140)}</p>

      <div className="post-card__meta">
        <span>{topicLabel}</span>
        <span>{post.author}</span>
        <span>{formatDate(post.createdAt)}</span>
        {isOwner ? <span>seu post</span> : null}
      </div>
    </button>
  );
}

function AuthCard({
  authMode,
  loginForm,
  registerForm,
  isSubmittingAuth,
  onModeChange,
  onLoginFormChange,
  onRegisterFormChange,
  onLogin,
  onRegister,
}) {
  return (
    <section className="auth-card">
      <div className="tab-group" role="tablist" aria-label="Acesso">
        <button
          type="button"
          className={`tab ${authMode === "login" ? "tab--active" : ""}`}
          onClick={() => onModeChange("login")}
        >
          Login
        </button>
        <button
          type="button"
          className={`tab ${authMode === "register" ? "tab--active" : ""}`}
          onClick={() => onModeChange("register")}
        >
          Cadastro
        </button>
      </div>

      {authMode === "login" ? (
        <form className="form-stack" onSubmit={onLogin}>
          <label className="field">
            <span>Email</span>
            <input
              type="email"
              value={loginForm.email}
              onChange={(event) =>
                onLoginFormChange((currentForm) => ({
                  ...currentForm,
                  email: event.target.value,
                }))
              }
              required
            />
          </label>

          <label className="field">
            <span>Senha</span>
            <input
              type="password"
              value={loginForm.password}
              onChange={(event) =>
                onLoginFormChange((currentForm) => ({
                  ...currentForm,
                  password: event.target.value,
                }))
              }
              required
            />
          </label>

          <button className="button button--primary" type="submit" disabled={isSubmittingAuth}>
            {isSubmittingAuth ? "Entrando..." : "Entrar"}
          </button>
        </form>
      ) : (
        <form className="form-stack" onSubmit={onRegister}>
          <label className="field">
            <span>Nome de usuario</span>
            <input
              type="text"
              value={registerForm.username}
              onChange={(event) =>
                onRegisterFormChange((currentForm) => ({
                  ...currentForm,
                  username: event.target.value,
                }))
              }
              required
            />
          </label>

          <label className="field">
            <span>Email</span>
            <input
              type="email"
              value={registerForm.email}
              onChange={(event) =>
                onRegisterFormChange((currentForm) => ({
                  ...currentForm,
                  email: event.target.value,
                }))
              }
              required
            />
          </label>

          <label className="field">
            <span>Senha</span>
            <input
              type="password"
              minLength="8"
              value={registerForm.password}
              onChange={(event) =>
                onRegisterFormChange((currentForm) => ({
                  ...currentForm,
                  password: event.target.value,
                }))
              }
              required
            />
          </label>

          <button className="button button--primary" type="submit" disabled={isSubmittingAuth}>
            {isSubmittingAuth ? "Criando..." : "Criar conta"}
          </button>
        </form>
      )}
    </section>
  );
}

function ComposerCard({
  editorMode,
  postForm,
  isAuthenticated,
  isSubmittingPost,
  onChange,
  onSubmit,
  onReset,
}) {
  return (
    <section className="panel side-card composer-card" id="composer-panel">
      <div className="side-card__header">
        <h3>{editorMode === "edit" ? "Editar post" : "Novo post"}</h3>
      </div>

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
              {editorMode === "edit" ? "Cancelar edicao" : "Limpar"}
            </button>
          </div>
        </form>
      ) : (
        <EmptyState
          title="Entre para publicar"
          description="Use o botao Entrar no topo."
        />
      )}

    </section>
  );
}

function DetailCard({ post, isAuthenticated, canManage, onEdit, onClose }) {
  const postTopic = post ? getPostTopic(post) : "";
  const topicLabel = topicLabels[postTopic] || postTopic;

  return (
    <section className="panel side-card side-card--detail">
      <div className="side-card__header">
        <h3>{post ? "Post" : "Escolha um post"}</h3>
      </div>

      {post ? (
        <>
          <h4 className="detail-title">{post.title}</h4>
          <p className="detail-author">
            por <strong>{post.author}</strong> em {formatDate(post.createdAt)} · {topicLabel}
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

function CommentsCard({
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
        <EmptyState
          title="Nada aberto ainda"
          description="Escolha um post para acompanhar a conversa."
        />
      ) : (
        <>
          <div className="comments-list">
            {isLoadingComments ? (
              Array.from({ length: 3 }).map((_, index) => (
                <div className="comment-item comment-item--skeleton" key={index}>
                  <div className="skeleton-line skeleton-line--short" />
                  <div className="skeleton-line" />
                </div>
              ))
            ) : comments.length ? (
              comments.map((comment) => (
                <CommentItem comment={comment} key={comment.id} />
              ))
            ) : (
              <EmptyState
                title="Ainda sem comentarios"
                description="Se a conversa te chamou, puxa o primeiro fio."
              />
            )}
          </div>

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

function EmptyState({ title, description }) {
  return (
    <div className="empty-state">
      <strong>{title}</strong>
      <p>{description}</p>
    </div>
  );
}

function getPostTopic(post) {
  return normalizeTopicValue(post.tema || post.curso || "");
}

function normalizeTopicValue(value) {
  return legacyTopicMap[value] || value;
}

function buildPostPayload(postForm) {
  return {
    title: postForm.title,
    content: postForm.content,
    tema: postForm.tema,
    curso: legacyTopicValues[postForm.tema] || postForm.tema,
  };
}

async function apiRequest(path, options = {}) {
  const { method = "GET", body, token } = options;
  const headers = {
    Accept: "application/json",
  };

  if (body) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const rawText = await response.text();
  const payload = rawText ? tryParseJson(rawText) : null;

  if (!response.ok) {
    throw new ApiClientError(extractErrorMessage(payload), response.status, payload);
  }

  return payload;
}

function tryParseJson(value) {
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

function extractErrorMessage(payload) {
  if (!payload) {
    return "Nao foi possivel concluir a requisicao.";
  }

  if (typeof payload === "string") {
    return payload;
  }

  if (Array.isArray(payload.fieldErrors) && payload.fieldErrors.length) {
    return payload.fieldErrors.map((error) => `${error.field}: ${error.message}`).join(" | ");
  }

  return payload.message || "Nao foi possivel concluir a requisicao.";
}

function normalizeApiUrl(value) {
  return value.endsWith("/") ? value.slice(0, -1) : value;
}

function formatDate(value) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function truncate(value, size) {
  if (value.length <= size) {
    return value;
  }

  return `${value.slice(0, size).trim()}...`;
}
