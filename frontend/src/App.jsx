import { useDeferredValue, useEffect, useState } from "react";

import { apiRequest, ApiClientError } from "./api/client";
import { Sidebar } from "./components/Sidebar";
import { Topbar } from "./components/Topbar";
import {
  initialCommentForm,
  initialLoginForm,
  initialPostForm,
  initialRegisterForm,
  TOKEN_STORAGE_KEY,
} from "./constants/forms";
import { topicLabels, topicOptions } from "./constants/topics";
import { AuthModal } from "./features/auth/AuthModal";
import { CommentsSection } from "./features/comments/CommentsSection";
import { ComposerModal } from "./features/posts/ComposerModal";
import { PostFeed } from "./features/posts/PostFeed";
import { ThreadView } from "./features/posts/ThreadView";
import { buildPostPayload, getPostTopic } from "./utils/posts";

export default function App() {
  const [token, setToken] = useState(() => window.localStorage.getItem(TOKEN_STORAGE_KEY) || "");
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [activePost, setActivePost] = useState(null);
  const [isPostViewOpen, setIsPostViewOpen] = useState(false);
  const [authMode, setAuthMode] = useState("login");
  const [loginForm, setLoginForm] = useState(initialLoginForm);
  const [registerForm, setRegisterForm] = useState(initialRegisterForm);
  const [postForm, setPostForm] = useState(initialPostForm);
  const [commentForm, setCommentForm] = useState(initialCommentForm);
  const [comments, setComments] = useState([]);
  const [editorMode, setEditorMode] = useState("create");
  const [search, setSearch] = useState("");
  const [topicFilter, setTopicFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [isAuthPanelOpen, setIsAuthPanelOpen] = useState(false);
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [isLoadingPosts, setIsLoadingPosts] = useState(true);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [isSubmittingAuth, setIsSubmittingAuth] = useState(false);
  const [isSubmittingPost, setIsSubmittingPost] = useState(false);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  const deferredSearch = useDeferredValue(search);
  const canManageActivePost =
    Boolean(profile) && Boolean(activePost) && profile.username === activePost.author;

  // Feedback visual ficou oculto por enquanto, mas mantemos um ponto unico para religar depois.
  const setMessage = () => {};

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
      setIsPostViewOpen(false);
      return;
    }

    if (!activePost) {
      return;
    }

    const refreshedPost = posts.find((post) => post.id === activePost.id);

    if (refreshedPost) {
      setActivePost(refreshedPost);
    }
  }, [posts, activePost]);

  useEffect(() => {
    const postId = activePost?.id;

    if (!postId || !isPostViewOpen) {
      setComments([]);
      return;
    }

    void loadComments(postId);
  }, [activePost?.id, isPostViewOpen]);

  useEffect(() => {
    if (!isAuthPanelOpen && !isComposerOpen) {
      return undefined;
    }

    function handleEscape(event) {
      if (event.key === "Escape") {
        setIsAuthPanelOpen(false);

        if (isComposerOpen) {
          closeComposer();
        }
      }
    }

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isAuthPanelOpen, isComposerOpen]);

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
    setIsComposerOpen(false);
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
      setIsPostViewOpen(true);
      setIsComposerOpen(false);
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
      openLoginModal();
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
    setIsPostViewOpen(true);
    setIsComposerOpen(true);
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

  function closeComposer() {
    setIsComposerOpen(false);
    resetComposer();
  }

  function openPost(post) {
    setActivePost(post);
    setIsPostViewOpen(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function closePostView() {
    setIsPostViewOpen(false);
    setActivePost(null);
    setCommentForm(initialCommentForm);
    setComments([]);
  }

  function openComposer() {
    if (!profile) {
      openLoginModal();
      return;
    }

    resetComposer();
    setIsComposerOpen(true);
  }

  function openLoginModal() {
    setAuthMode("login");
    setIsAuthPanelOpen(true);
  }

  function openRegisterModal() {
    setAuthMode("register");
    setIsAuthPanelOpen(true);
  }

  function showFeed() {
    closePostView();
    setPage(0);
  }

  function showHome() {
    closePostView();
    setPage(0);
    setStatusFilter("ALL");
    setTopicFilter("ALL");
  }

  function showPopular() {
    closePostView();
    setPage(0);
    setStatusFilter("ABERTO");
  }

  function showExplore() {
    closePostView();
    setStatusFilter("ALL");
    setTopicFilter("ALL");
  }

  function selectTopic(topic) {
    closePostView();
    setPage(0);
    setTopicFilter(topic);
  }

  function previousPage() {
    setPage((currentPage) => Math.max(currentPage - 1, 0));
  }

  function nextPage() {
    setPage((currentPage) =>
      currentPage + 1 >= totalPages ? currentPage : currentPage + 1
    );
  }

  return (
    <div className="app-shell">
      <div className="background-grid" />

      <Topbar
        search={search}
        profile={profile}
        onSearchChange={setSearch}
        onFeedClick={showFeed}
        onCreatePost={openComposer}
        onLogin={openLoginModal}
        onRegister={openRegisterModal}
        onLogout={() => logout()}
      />

      <main className="layout">
        <section className="overview-bar">
          <div>
            <h2>Discussões recentes</h2>
            <p>Escolha um tema, leia com calma e entre na conversa.</p>
          </div>
        </section>

        <section className="social-layout">
          <Sidebar
            topicOptions={topicOptions}
            topicFilter={topicFilter}
            statusFilter={statusFilter}
            onHome={showHome}
            onPopular={showPopular}
            onExplore={showExplore}
            onCreatePost={openComposer}
            onTopicSelect={selectTopic}
          />

          <section className="main-column">
            {isPostViewOpen && activePost ? (
              <>
                <ThreadView
                  post={activePost}
                  isAuthenticated={Boolean(profile)}
                  canManage={canManageActivePost}
                  onBack={closePostView}
                  onEdit={startEditing}
                  onClose={handleClosePost}
                />

                <CommentsSection
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
              </>
            ) : (
              <PostFeed
                posts={visiblePosts}
                page={page}
                totalPages={totalPages}
                profile={profile}
                isLoadingPosts={isLoadingPosts}
                onOpenPost={openPost}
                onPreviousPage={previousPage}
                onNextPage={nextPage}
              />
            )}
          </section>
        </section>
      </main>

      {!profile && isAuthPanelOpen ? (
        <AuthModal
          authMode={authMode}
          loginForm={loginForm}
          registerForm={registerForm}
          isSubmittingAuth={isSubmittingAuth}
          onClose={() => setIsAuthPanelOpen(false)}
          onModeChange={setAuthMode}
          onLoginFormChange={setLoginForm}
          onRegisterFormChange={setRegisterForm}
          onLogin={handleLogin}
          onRegister={handleRegister}
        />
      ) : null}

      {profile && isComposerOpen ? (
        <ComposerModal
          editorMode={editorMode}
          postForm={postForm}
          isAuthenticated={Boolean(profile)}
          isSubmittingPost={isSubmittingPost}
          onClose={closeComposer}
          onChange={setPostForm}
          onSubmit={handlePostSubmit}
          onReset={resetComposer}
        />
      ) : null}
    </div>
  );
}
