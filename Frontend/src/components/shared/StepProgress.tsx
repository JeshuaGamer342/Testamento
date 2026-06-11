type StepProgressProps = {
  steps: string[]
  activeStep: number
  completedSteps?: number[]
  showCheckOnCompleted?: boolean
  className?: string
}

function StepProgress({
  steps,
  activeStep,
  completedSteps = [],
  showCheckOnCompleted = false,
  className = '',
}: StepProgressProps) {
  const wrapperClassName = ['step-progress', className].filter(Boolean).join(' ')

  return (
    <ol className={wrapperClassName} aria-label="Progreso del formulario">
      {steps.map((step, index) => {
        const number = index + 1
        const isActive = number === activeStep
        const isCompleted = completedSteps.includes(number)
        const stepClassName = [
          isActive ? 'step-active' : '',
          isCompleted ? 'step-completed' : '',
        ]
          .filter(Boolean)
          .join(' ')

        const marker = isCompleted && showCheckOnCompleted ? 'v' : number

        return (
          <li key={step} className={stepClassName}>
            <span>{marker}</span>
            <p>{step}</p>
          </li>
        )
      })}
    </ol>
  )
}

export default StepProgress
