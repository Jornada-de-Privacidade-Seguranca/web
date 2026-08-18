<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

<!-- BEGIN:architecture-rules -->
# Arquitetura e Estrutura de Arquivos

## Padrão: MVVM
Este projeto segue o padrão MVVM (Model-View-ViewModel). Toda feature deve ser estruturada de acordo. Não desvie desta convenção.

---

## Estrutura de Arquivos por Feature

Cada feature reside em `src/features/<nomeDaFeature>/` e deve seguir esta estrutura:

```
src/features/algumaFeature/
├── components/                    # Componentes locais usados apenas por esta feature
│   └── AlgumComponente/
│       ├── index.tsx
│       ├── algumComponente.viewmodel.ts
│       └── algumComponente.types.ts
├── index.tsx                      # View principal — consome o hook da ViewModel
├── algumaFeature.viewmodel.ts     # ViewModel — lógica de negócio e estado
├── algumaFeature.types.ts         # Todos os tipos desta feature
└── algumaFeature.store.ts         # (opcional) Slice Zustand desta feature
```

---

## Convenções de Arquivos

### `algumaFeature.viewmodel.ts`
- Contém um único hook personalizado com toda a lógica de negócio, estado derivado e handlers da feature.
- O nome do hook deve seguir o padrão `useNomeDaFeatureVM`.
- Deve retornar apenas o que a View precisa — sem slices brutos do store, sem detalhes de implementação interna.
- Não deve conter nenhum JSX.

```ts
// ✅ Correto
export function useJornadaVM() {
  const [step, setStep] = useState(0)

  function handleNext() { ... }

  return { step, handleNext }
}

// ❌ Incorreto — evite expor detalhes internos
export function useJornadaVM() {
  return { store, dispatch, internalRef }
}
```

---

### `index.tsx`
- Contém a View principal da feature.
- Deve consumir o hook da ViewModel e usar apenas o que ele retorna.
- Não deve conter lógica de negócio — delegue tudo à ViewModel.
- Não deve fazer chamadas diretas à API nem acessar o store diretamente.

```tsx
// ✅ Correto
import { useJornadaVM } from './jornada.viewmodel'

export default function JornadaView() {
  const { step, handleNext } = useJornadaVM()

  return <div>...</div>
}

// ❌ Incorreto — lógica de negócio na View
export default function JornadaView() {
  const [step, setStep] = useState(0)
  async function handleNext() { await api.post(...) }

  return <div>...</div>
}
```

---

### `algumaFeature.types.ts`
- Contém todos os tipos e interfaces TypeScript relacionados à feature.
- Cobre props da View, tipos de retorno da ViewModel, estado do store e payloads de serviços.
- Deve ser a fonte única de verdade para tipos dentro da feature — não declare tipos inline em outros arquivos.

```ts
// ✅ Correto
export interface JornadaStep {
  id: string
  title: string
}

export interface JornadaViewModelReturn {
  step: number
  handleNext: () => void
}
```

---

### `algumaFeature.store.ts` (opcional)
- Crie este arquivo apenas se a feature precisar de estado persistente ou compartilhado via Zustand.
- Deve exportar um único hook de store Zustand com o nome `useNomeDaFeatureStore`.
- A ViewModel é responsável por consumir o store — a View nunca deve acessar o store diretamente.

```ts
// ✅ Correto
export const useJornadaStore = create<JornadaState>()(...)

// ❌ Incorreto — store consumido diretamente na View
import { useJornadaStore } from './jornada.store'
export default function JornadaView() {
  const step = useJornadaStore(s => s.step)
  ...
}
```

---

## Componentes Locais

- Componentes usados apenas dentro de uma feature devem residir em `src/features/<nomeDaFeature>/components/`.
- Cada componente local deve seguir a mesma estrutura MVVM de uma feature (com seu próprio `index.tsx`, `viewmodel.ts` e `types.ts`).
- Não coloque componentes específicos de uma feature na pasta global `src/components/`.

```
// ✅ Correto — componente local
src/features/jornada/components/StepIndicator/
├── index.tsx
├── stepIndicator.viewmodel.ts
└── stepIndicator.types.ts

// ❌ Incorreto — componente específico de feature na pasta global
src/components/ui/StepIndicator/
```

---

## Estrutura Global Compartilhada

```
src/
├── components/        # Apenas componentes de UI e layout reutilizáveis globalmente
│   ├── ui/
│   └── layout/
├── hooks/             # Hooks reutilizáveis globalmente (não específicos de feature)
├── services/          # Configuração do cliente de API e funções de serviço compartilhadas
├── store/             # Configuração global do Zustand
├── types/             # Tipos TypeScript globais
└── shared/
    ├── config/        # Variáveis de ambiente (sempre use src/shared/config/env.ts — nunca process.env diretamente)
    ├── constants/     # Constantes e enums globais
    ├── fonts/         # Configuração do next/font
    ├── i18n/          # Configuração de internacionalização e arquivos de tradução
    ├── styles/        # CSS global e design tokens
    ├── theme/         # Cores, tipografia e breakpoints
    └── utils/         # Funções utilitárias globais
```

---

## Regras Gerais

- **Nunca** acesse `process.env` diretamente — sempre importe de `src/shared/config/env.ts`.
- **Nunca** coloque lógica de negócio na View (`index.tsx`) — ela pertence à ViewModel.
- **Nunca** deixe a View acessar o store diretamente — a ViewModel é a mediadora de todo estado.
- **Sempre** declare os tipos em `algumaFeature.types.ts` — evite declarações de tipo inline em outros arquivos.
- **Sempre** use path aliases nos imports — nunca use caminhos relativos subindo mais de um nível.

```ts
// ✅ Correto
import { env } from '@shared/config/env'
import { Button } from '@components/ui/Button'

// ❌ Incorreto
import { env } from '../../../shared/config/env'
```

- **Barrel exports** (`index.ts`) devem ser usados em todas as pastas para simplificar os imports.
- Componentes devem ser nomeados em **PascalCase** e hooks, utilitários e demais arquivos em **camelCase**.
- Os nomes dos arquivos devem corresponder ao nome da feature ou componente que representam — sem nomes genéricos como `helpers.ts` ou `misc.ts`.
<!-- END:architecture-rules -->