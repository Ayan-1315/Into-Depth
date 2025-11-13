import './IntroPage.css'

export default function IntroPage({ onEnter }) {
  return (
    <div className="intro-wrapper" onClick={onEnter}>
      <div className="intro-header">Into The Depth</div>
      <div className="intro-content">
        <p>Click to begin</p>
      </div>
    </div>
  )
}
