"use client"

import { Component, type ReactNode, type ErrorInfo } from "react"
import { Button } from "@/components/ui/button"

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  message: string
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, message: "" }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("ErrorBoundary caught:", error, info)
  }

  reset = () => this.setState({ hasError: false, message: "" })

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback
      return (
        <div className="flex flex-col items-center justify-center min-h-[300px] gap-4 p-8 text-center">
          <p className="text-lg font-semibold text-destructive">Something went wrong</p>
          {this.state.message && (
            <p className="text-sm text-muted-foreground max-w-md">{this.state.message}</p>
          )}
          <Button variant="outline" onClick={this.reset}>Try again</Button>
        </div>
      )
    }
    return this.props.children
  }
}
