/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export default class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught application error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0D0D0D] text-[#F5F0EB] flex items-center justify-center p-6 font-sans">
          <div className="max-w-lg w-full bg-[#161616] border border-[#2E2E2E] rounded-lg p-6 sm:p-8 space-y-4 text-center shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 mx-auto flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h1 className="text-xl font-bold uppercase tracking-wide text-white">
              Algo não carregou como esperado
            </h1>

            <p className="text-xs text-[#A8A39E] leading-relaxed">
              Ocorreu um erro ao renderizar esta visualização. Você pode tentar recarregar ou retornar ao início.
            </p>

            {this.state.error && (
              <div className="bg-[#0A0A0A] border border-[#222] p-3 rounded text-left overflow-x-auto text-[11px] font-mono text-[#E5A823]">
                {this.state.error.toString()}
              </div>
            )}

            <div className="pt-2 flex flex-col sm:flex-row gap-2 justify-center">
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-[#E5A823] text-black font-bold text-xs uppercase tracking-wider rounded hover:bg-yellow-400 transition-colors inline-flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Recarregar Página</span>
              </button>
              <a
                href="#/"
                onClick={() => {
                  this.setState({ hasError: false, error: null, errorInfo: null });
                  window.location.hash = "#/";
                }}
                className="px-4 py-2 bg-[#222] text-[#DDD] hover:text-white font-bold text-xs uppercase tracking-wider rounded border border-[#333] transition-colors inline-flex items-center justify-center"
              >
                Voltar ao Início
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
