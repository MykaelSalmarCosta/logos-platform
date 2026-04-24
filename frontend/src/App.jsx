import { useDeferredValue, useEffect, useState } from "react";

const TOKEN_STORAGE_KEY = "logos_token";
const API_URL = normalizeApiUrl(import.meta.env.VITE_API_URL || "http://localhost:8080");

const courseOptions = [
  { value: "JAVA", label: "Java" },
  { value: "SPRING_BOOT", label: "Spring Boot" },
  { value: "MYSQL", label: "MySQL" },
  { value: "SEGURANCA", label: "Seguranca" },
  { value: "API_REST", label: "API REST" },
  { value: "DEVOPS", label: "DevOps" },
  { value: "FRONTEND", label: "Frontend" },
];

const courseLabels = Object.fromEntries(courseOptions.map((option) => [option.value, option.label]));
const statusLabels = {
  ABERTO: "Aberto",
  FECHADO: "Fechado",
};

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
  curso: "JAVA",
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
  const [editorMode, setEditorMode] = useState("create");
  const [message, setMessage] = useState(null);
  const [search, setSearch] = useState("");
  const [courseFilter, setCourseFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [isLoadingPosts, setIsLoadingPosts] = useState(true);
  const [isLoadingProfile, setIsLoadingProfile] = useState(Boolean(token));
  const [isSubmittingAuth, setIsSubmittingAuth] = useState(false);
  const [isSubmittingPost, setIsSubmittingPost] = useState(false);

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

  const visiblePosts = posts.filter((post) => {
    const normalizedSearch = deferredSearch.trim().toLowerCase();
    const matchesSearch =
      !normalizedSearch ||
      [post.title, post.content, post.author, courseLabels[post.curso] || post.curso]
        .join(" ")
        .toLowerCase()
        .includes(normalizedSearch);

    const matchesCourse = courseFilter === "ALL" || post.curso === courseFilter;
    const matchesStatus = statusFilter === "ALL" || post.status === statusFilter;

    return matchesSearch && matchesCourse && matchesStatus;
  });

  const openPostsCount = posts.filter((post) => post.status === "ABERTO").length;
  const trackedTopicsCount = new Set(posts.map((post) => post.curso)).size;
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
    setIsLoadingProfile(true);

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
    } finally {
      setIsLoadingProfile(false);
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
      setMessage({
        type: "success",
        text: "Login realizado. Agora voce pode publicar e editar seus posts.",
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
      setMessage({
        type: "success",
        text: "Conta criada com sucesso. Sua sessao ja esta ativa.",
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
        body: postForm,
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

  function startEditing(post) {
    setActivePost(post);
    setEditorMode("edit");
    setPostForm({
      title: post.title,
      content: post.content,
      curso: post.curso,
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

  return (
    <div className="app-shell">
      <div className="background-orb background-orb--one" />
      <div className="background-orb background-orb--two" />
      <div className="background-grid" />

      <header className="topbar">
        <div className="brand-block">
          <span className="brand-mark">L</span>
          <div>
            <p className="eyebrow">forum api + interface web</p>
            <h1>Logos Platform</h1>
          </div>
        </div>

        <div className="topbar__status">
          <span className="status-pill">
            {profile ? `Sessao ativa: ${profile.username}` : "Leitura publica liberada"}
          </span>
          <span className="status-pill status-pill--soft">API: {API_URL}</span>
        </div>
      </header>

      <main className="layout">
        <section className="hero-card panel">
          <div className="hero-card__content">
            <p className="eyebrow">debate, estudo e autoria</p>
            <h2>
              Uma interface para transformar a API do Logos em produto de verdade.
            </h2>
            <p className="hero-copy">
              O feed fica aberto para leitura, enquanto o login libera cadastro, publicacao,
              edicao e fechamento dos seus posts. A ideia aqui foi dar cara de plataforma ao que
              antes era so backend.
            </p>

            <div className="hero-actions">
              <button className="button button--primary" type="button" onClick={() => setPage(0)}>
                Ver feed
              </button>
              <button
                className="button button--secondary"
                type="button"
                onClick={() => {
                  setAuthMode(profile ? "login" : "register");
                  resetComposer();
                }}
              >
                {profile ? "Novo post" : "Criar conta"}
              </button>
            </div>
          </div>

          <div className="hero-metrics">
            <MetricCard value={posts.length} label="posts nesta pagina" />
            <MetricCard value={openPostsCount} label="discussoes abertas" />
            <MetricCard value={trackedTopicsCount} label="temas ativos" />
          </div>
        </section>

        {message ? <FeedbackBanner message={message} /> : null}

        <section className="content-grid">
          <div className="feed-column">
            <div className="panel section-card">
              <div className="section-card__header">
                <div>
                  <p className="eyebrow">feed</p>
                  <h3>Ultimos posts publicados</h3>
                </div>
                <p className="section-hint">
                  Explore o conteudo livremente. Para publicar, basta entrar com sua conta.
                </p>
              </div>

              <div className="filters">
                <label className="field">
                  <span>Buscar</span>
                  <input
                    type="text"
                    placeholder="Titulo, autor ou assunto"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                  />
                </label>

                <label className="field">
                  <span>Curso</span>
                  <select
                    value={courseFilter}
                    onChange={(event) => setCourseFilter(event.target.value)}
                  >
                    <option value="ALL">Todos</option>
                    {courseOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="field">
                  <span>Status</span>
                  <select
                    value={statusFilter}
                    onChange={(event) => setStatusFilter(event.target.value)}
                  >
                    <option value="ALL">Todos</option>
                    <option value="ABERTO">Aberto</option>
                    <option value="FECHADO">Fechado</option>
                  </select>
                </label>
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
            </div>
          </div>

          <aside className="side-column">
            {profile ? (
              <SessionCard
                profile={profile}
                isLoadingProfile={isLoadingProfile}
                onLogout={() => logout()}
              />
            ) : (
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
            )}

            <ComposerCard
              editorMode={editorMode}
              postForm={postForm}
              isAuthenticated={Boolean(profile)}
              isSubmittingPost={isSubmittingPost}
              activePost={activePost}
              onChange={setPostForm}
              onSubmit={handlePostSubmit}
              onReset={resetComposer}
            />

            <DetailCard
              post={activePost}
              isAuthenticated={Boolean(profile)}
              canManage={canManageActivePost}
              onEdit={startEditing}
              onClose={handleClosePost}
            />
          </aside>
        </section>
      </main>
    </div>
  );
}

function FeedbackBanner({ message }) {
  return (
    <div className={`feedback-banner feedback-banner--${message.type}`}>
      <strong>{message.type === "error" ? "Ajuste rapido" : "Atualizacao"}</strong>
      <p>{message.text}</p>
    </div>
  );
}

function MetricCard({ value, label }) {
  return (
    <article className="metric-card">
      <strong>{value}</strong>
      <span>{label}</span>
    </article>
  );
}

function PostCard({ post, isActive, isOwner, onSelect }) {
  return (
    <button
      type="button"
      className={`post-card ${isActive ? "post-card--active" : ""}`}
      onClick={onSelect}
    >
      <div className="post-card__top">
        <span className={`badge badge--${post.status.toLowerCase()}`}>
          {statusLabels[post.status] || post.status}
        </span>
        {isOwner ? <span className="badge badge--owner">seu post</span> : null}
      </div>

      <h4>{post.title}</h4>
      <p>{truncate(post.content, 140)}</p>

      <div className="post-card__meta">
        <span>{courseLabels[post.curso] || post.curso}</span>
        <span>{post.author}</span>
        <span>{formatDate(post.createdAt)}</span>
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
    <section className="panel side-card">
      <div className="side-card__header">
        <p className="eyebrow">acesso</p>
        <h3>Entre para participar</h3>
      </div>

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

function SessionCard({ profile, isLoadingProfile, onLogout }) {
  return (
    <section className="panel side-card">
      <div className="side-card__header">
        <p className="eyebrow">sua sessao</p>
        <h3>{isLoadingProfile ? "Atualizando..." : profile.username}</h3>
      </div>

      <dl className="session-list">
        <div>
          <dt>Email</dt>
          <dd>{profile.email}</dd>
        </div>
        <div>
          <dt>Conta criada</dt>
          <dd>{profile.createdAt ? formatDate(profile.createdAt) : "Agora"}</dd>
        </div>
      </dl>

      <button className="button button--ghost" type="button" onClick={onLogout}>
        Sair
      </button>
    </section>
  );
}

function ComposerCard({
  editorMode,
  postForm,
  isAuthenticated,
  isSubmittingPost,
  activePost,
  onChange,
  onSubmit,
  onReset,
}) {
  return (
    <section className="panel side-card">
      <div className="side-card__header">
        <p className="eyebrow">editor</p>
        <h3>{editorMode === "edit" ? "Editar post" : "Criar novo post"}</h3>
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
            <span>Assunto principal</span>
            <select
              value={postForm.curso}
              onChange={(event) =>
                onChange((currentForm) => ({
                  ...currentForm,
                  curso: event.target.value,
                }))
              }
            >
              {courseOptions.map((option) => (
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
          description="O feed esta aberto, mas a escrita fica liberada depois do login."
        />
      )}

      {activePost ? (
        <p className="editor-note">
          Post selecionado: <strong>{activePost.title}</strong>
        </p>
      ) : null}
    </section>
  );
}

function DetailCard({ post, isAuthenticated, canManage, onEdit, onClose }) {
  return (
    <section className="panel side-card side-card--detail">
      <div className="side-card__header">
        <p className="eyebrow">destaque</p>
        <h3>{post ? "Post selecionado" : "Escolha um post"}</h3>
      </div>

      {post ? (
        <>
          <div className="detail-meta">
            <span className={`badge badge--${post.status.toLowerCase()}`}>
              {statusLabels[post.status] || post.status}
            </span>
            <span className="detail-chip">{courseLabels[post.curso] || post.curso}</span>
          </div>

          <h4 className="detail-title">{post.title}</h4>
          <p className="detail-author">
            por <strong>{post.author}</strong> em {formatDate(post.createdAt)}
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

function EmptyState({ title, description }) {
  return (
    <div className="empty-state">
      <strong>{title}</strong>
      <p>{description}</p>
    </div>
  );
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
