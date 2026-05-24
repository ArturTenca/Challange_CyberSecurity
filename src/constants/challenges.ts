/**
 * Ford Challenge Definitions
 * Sprint: Mobile Development and IoT
 */

export enum ChallengeType {
  COMPETITIVE_INTELLIGENCE = 'competitive_intelligence',
  CUSTOMER_RETENTION = 'customer_retention',
}

export interface Challenge {
  id: ChallengeType;
  name: string;
  description: string;
  icon: string;
  color: string;
  objective: string;
  keyFeatures: string[];
  targetAudience: string;
  dataSource: string;
  metrics: string[];
}

export const CHALLENGES: Record<ChallengeType, Challenge> = {
  [ChallengeType.COMPETITIVE_INTELLIGENCE]: {
    id: ChallengeType.COMPETITIVE_INTELLIGENCE,
    name: 'Inteligência Competitiva Automotiva',
    description:
      'Desenvolva uma solução que analisa dados de mercado e competitors para fornecer insights estratégicos.',
    icon: '📊',
    color: '#0066CC',
    objective:
      'Criar inteligência competitiva em tempo real com análise de mercado, comparação de modelos e tendências',
    keyFeatures: [
      'Comparação de specs com competitors',
      'Dashboard com análise de preços',
      'Tendências de mercado em tempo real',
      'Relatórios comparativos',
      'Análise de avaliações e reviews',
    ],
    targetAudience: 'Analistas internos e executivos da Ford',
    dataSource: 'APIs de dados automotivos, datasets públicos, web scraping',
    metrics: [
      'Precisão de dados',
      'Tempo de atualização',
      'Valor dos insights gerados',
    ],
  },

  [ChallengeType.CUSTOMER_RETENTION]: {
    id: ChallengeType.CUSTOMER_RETENTION,
    name: 'Retenção e Fidelização de Clientes',
    description:
      'Desenvolva uma solução para engajar clientes no pós-venda e aumentar lealdade à marca.',
    icon: '💎',
    color: '#10B981',
    objective:
      'Criar experiência de pós-venda excepcional com manutenção, ofertas personalizadas e comunidade',
    keyFeatures: [
      'Programa de fidelização com gamificação',
      'Lembretes de manutenção',
      'Ofertas personalizadas',
      'Histórico de serviços',
      'Comunidade de proprietários',
    ],
    targetAudience: 'Clientes da rede de concessionárias Ford',
    dataSource: 'CRM da Ford, histórico de serviços, dados de preferências',
    metrics: [
      'Taxa de retenção',
      'Engagement do usuário',
      'Satisfação do cliente',
    ],
  },
};

export const getChallengeById = (id: ChallengeType): Challenge => {
  return CHALLENGES[id];
};

export const getAllChallenges = (): Challenge[] => {
  return Object.values(CHALLENGES);
};
