export default function PageHeader({ eyebrow, title, description, actions }) {
  return (
    <section className="page-header panel">
      <div className="page-header__content">
        {eyebrow ? <p className="page-header__eyebrow">{eyebrow}</p> : null}
        <h1 className="page-header__title">{title}</h1>
        {description ? <p className="page-header__description">{description}</p> : null}
      </div>
      {actions ? <div className="page-header__actions">{actions}</div> : null}
    </section>
  );
}
