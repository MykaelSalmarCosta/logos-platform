export function AuthModal({
  authMode,
  loginForm,
  registerForm,
  isSubmittingAuth,
  onClose,
  onModeChange,
  onLoginFormChange,
  onRegisterFormChange,
  onLogin,
  onRegister,
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
      <section className="auth-modal" role="dialog" aria-modal="true" aria-labelledby="auth-title">
        <div className="auth-modal__header">
          <h2 id="auth-title">{authMode === "login" ? "Entrar" : "Criar conta"}</h2>
          <button className="modal-close" type="button" aria-label="Fechar" onClick={onClose}>
            X
          </button>
        </div>
        <AuthCard
          authMode={authMode}
          loginForm={loginForm}
          registerForm={registerForm}
          isSubmittingAuth={isSubmittingAuth}
          onModeChange={onModeChange}
          onLoginFormChange={onLoginFormChange}
          onRegisterFormChange={onRegisterFormChange}
          onLogin={onLogin}
          onRegister={onRegister}
        />
      </section>
    </div>
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
