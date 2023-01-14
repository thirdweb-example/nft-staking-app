import styles from "../styles/Home.module.css"

export default function adminFormRow(options) {
  const {
    type,
    label,
    value,
    onChange,
    buttons,
    values,
    placeholder,
    hasError,
    errorText,
  } = options

  let inputType = type
  switch (type) {
    case `address`:
      inputType = `text`
      break
  }

  return (
    <div className={`${styles.adminFormInputHolder} ${(hasError) ? styles.hasError : ''}`}>
      {type === 'list' ? (
        <>
          <label>{label}: ({value})</label>
          <div>
            {hasError && errorText && (
              <span className={styles.hasError}>{errorText}</span>
            )}
            <select value={value} onChange={(v) => onChange(v.target.value)}>
              {values.map((item) => {
                return (
                  <option value={item.id} key={item.id}>{item.title}</option>
                )
              })}
            </select>
          </div>
        </>
      ) : (
        <>
          <label>{label}:</label>
          {hasError && errorText && (
            <span className={styles.hasError}>{errorText}</span>
          )}
          <div>
            <input type={inputType} placeholder={placeholder || ``} value={value} onChange={(v) => onChange(v.target.value)} />
          </div>
        </>
      )}
      {buttons && (
        <div className={styles.adminFormButtonsHolder}>{buttons}</div>
      )}
    </div>
  )
}