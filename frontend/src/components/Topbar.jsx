import { LogoMark } from "./LogoMark";

export function Topbar({
  search,
  profile,
  onSearchChange,
  onFeedClick,
  onCreatePost,
  onLogin,
  onRegister,
  onLogout,
}) {
  return (
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
            onChange={(event) => onSearchChange(event.target.value)}
          />
        </label>

        <button className="topbar-link" type="button" onClick={onFeedClick}>
          Feed
        </button>

        {profile ? (
          <>
            <button className="button button--primary button--small" type="button" onClick={onCreatePost}>
              Criar post
            </button>
            <span className="account-name">{profile.username}</span>
            <button className="button button--ghost button--small" type="button" onClick={onLogout}>
              Sair
            </button>
          </>
        ) : (
          <>
            <button className="button button--ghost button--small" type="button" onClick={onCreatePost}>
              Criar post
            </button>
            <button className="button button--ghost button--small" type="button" onClick={onLogin}>
              Entrar
            </button>
            <button className="button button--primary button--small" type="button" onClick={onRegister}>
              Criar conta
            </button>
          </>
        )}
      </div>
    </header>
  );
}
