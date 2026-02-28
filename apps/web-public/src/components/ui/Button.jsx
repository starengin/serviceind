export default function Button({
  className = "",
  loading = false,
  children,
  ...props
}) {
  const cls = `btn btnAnim ${loading ? "isLoading" : ""} ${className}`.trim();

  return (
    <button className={cls} disabled={loading || props.disabled} {...props}>
      <span className="btnText">{children}</span>
      {loading ? <span className="btnSpinner" aria-hidden="true" /> : null}
    </button>
  );
}