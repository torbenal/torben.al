import clsx from 'clsx'
import styles from './cycle-text.module.scss'

type Props = {
  textArray: string[]
}

const CycleText = ({ textArray }: Props) => (
  <div className={styles.cycleWrapper}>
    {/* <div className={styles.rwSentence}> */}
    <div className={clsx(styles.rwWords, styles.rwWords1)}>
      {textArray.map((text, i) => (
        <span key={i}>{text}</span>
      ))}
    </div>
    {/* </div> */}
  </div>
)

export default CycleText
