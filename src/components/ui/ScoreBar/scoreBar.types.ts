import type { ScoreBand } from "@shared/utils/scoreBand";

export interface ScoreBarMarker {
  /** Posição do marcador, de 0 a 100 */
  value: number;
  /** Texto lido pelo leitor de tela (ex.: "Mínimo recomendado: 60") */
  ariaLabel: string;
}

export interface ScoreBarProps {
  /** Nota de 0 a 100, já arredondada */
  value: number;
  band: ScoreBand;
  /** Rótulo da faixa, conforme o idioma (ex.: "Forte") */
  bandLabel: string;
  /** Rótulo acessível da barra (ex.: "Privacy by design: Médio, 67 de 100") */
  ariaLabel: string;
  /** Marcador opcional sobre a barra, como o mínimo recomendado */
  marker?: ScoreBarMarker;
  className?: string;
}

export interface ScoreBarViewModelReturn {
  value: number;
  text: string;
  ariaLabel: string;
  textClassName: string;
  fillClassName: string;
  markerPosition: number | null;
  markerAriaLabel: string | null;
  className?: string;
}
