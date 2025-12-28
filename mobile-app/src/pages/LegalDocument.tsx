import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonSpinner
} from '@ionic/react';
import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';

// Map of document types to their titles and file paths
const LEGAL_DOCUMENTS: Record<string, { title: string; path: string; icon: string }> = {
  'privacy-policy': {
    title: 'Política de Privacidad',
    path: '/POLITICA_DE_PRIVACIDAD.md',
    icon: '🔒'
  },
  'terms-conditions': {
    title: 'Términos y Condiciones',
    path: '/TERMINOS_Y_CONDICIONES.md',
    icon: '📄'
  },
  'legal-declaration': {
    title: 'Declaración Legal',
    path: '/DECLARACION_LEGAL.md',
    icon: '⚖️'
  }
};

const LegalDocument: React.FC = () => {
  const { documentType } = useParams<{ documentType: string }>();
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const document = LEGAL_DOCUMENTS[documentType];

  useEffect(() => {
    const fetchDocument = async () => {
      if (!document) {
        setError('Documento no encontrado');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(document.path);
        if (!response.ok) {
          throw new Error('No se pudo cargar el documento');
        }
        const text = await response.text();
        setContent(text);
        setError(null);
      } catch (err) {
        console.error('Error loading document:', err);
        setError('Error al cargar el documento. Por favor, intente nuevamente.');
      } finally {
        setLoading(false);
      }
    };

    fetchDocument();
  }, [documentType, document]);

  // Convert markdown to premium styled HTML for display
  const formatMarkdown = (markdown: string): string => {
    let html = markdown
      // Escape any existing HTML to prevent XSS
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      // Headers with premium styling - must process from most specific to least
      .replace(/^#### (.*$)/gim, '<h4 style="font-size: 16px; font-weight: 700; margin: 28px 0 14px 0; color: var(--ion-color-primary); letter-spacing: -0.01em; line-height: 1.3; border-left: 4px solid var(--ion-color-primary); padding-left: 16px;">$1</h4>')
      .replace(/^### (.*$)/gim, '<h3 style="font-size: 18px; font-weight: 700; margin: 32px 0 16px 0; color: var(--ion-color-dark); letter-spacing: -0.01em; line-height: 1.3; padding-bottom: 8px; border-bottom: 2px solid rgba(0,113,227,0.1);">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 style="font-size: 22px; font-weight: 700; margin: 44px 0 20px 0; color: var(--ion-color-dark); letter-spacing: -0.02em; line-height: 1.2; padding-bottom: 12px; border-bottom: 3px solid rgba(0,113,227,0.15);">$2</h2>')
      .replace(/^# (.*$)/gim, '<h1 style="font-size: 28px; font-weight: 800; margin: 0 0 28px 0; background: linear-gradient(135deg, var(--ion-color-primary) 0%, #5856d6 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; letter-spacing: -0.02em; line-height: 1.2; padding-bottom: 16px; border-bottom: 4px solid rgba(0,113,227,0.2);">$1</h1>')
      // Bold text with subtle highlight
      .replace(/\*\*(.*?)\*\*/gim, '<strong style="font-weight: 700; color: var(--ion-color-dark); background: linear-gradient(180deg, transparent 0%, transparent 60%, rgba(0,113,227,0.08) 60%, rgba(0,113,227,0.08) 100%); padding: 2px 0;">$1</strong>')
      // Line breaks and paragraphs with enhanced styling
      .replace(/\n\n/g, '</p><p style="margin: 20px 0; line-height: 1.8; color: var(--ion-color-medium); font-size: 15px; text-align: justify;">')
      .replace(/\n/g, '<br>');

    // Handle unordered lists with premium styling
    html = html.replace(/((?:^- .*$\n?)+)/gim, (match) => {
      const items = match.split('\n')
        .filter(line => line.trim())
        .map(line => line.replace(/^- (.*)$/, '<li style="margin: 14px 0; line-height: 1.8; color: var(--ion-color-medium); font-size: 15px; padding-left: 12px; position: relative;">$1</li>'))
        .join('');
      return `<ul style="margin: 28px 0; padding-left: 32px; list-style-type: none;"><style>ul li::before { content: "•"; color: var(--ion-color-primary); font-weight: bold; font-size: 20px; position: absolute; left: -20px; }</style>${items}</ul>`;
    });

    // Handle numbered lists
    html = html.replace(/((?:^\d+\. .*$\n?)+)/gim, (match) => {
      const items = match.split('\n')
        .filter(line => line.trim())
        .map(line => line.replace(/^\d+\. (.*)$/, '<li style="margin: 14px 0; line-height: 1.8; color: var(--ion-color-medium); font-size: 15px; padding-left: 12px;">$1</li>'))
        .join('');
      return `<ol style="margin: 28px 0; padding-left: 32px; counter-reset: item; list-style-type: none;"><style>ol li::before { content: counter(item) ". "; counter-increment: item; color: var(--ion-color-primary); font-weight: 700; font-size: 16px; }</style>${items}</ol>`;
    });

    // Add decorative elements for key sections (indicated by **text** at start of line)
    html = html.replace(/^<strong style="[^"]*">([^<]+)<\/strong>:/gim, (match, text) => {
      return `<div style="display: flex; align-items: center; gap: 12px; margin: 24px 0 12px 0;"><div style="width: 4px; height: 24px; background: linear-gradient(180deg, var(--ion-color-primary) 0%, #5856d6 100%); border-radius: 2px;"></div><strong style="font-weight: 700; color: var(--ion-color-dark); font-size: 16px; letter-spacing: -0.01em;">${text}:</strong></div>`;
    });

    return html;
  };

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar style={{ 
          '--background': 'linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(255,255,255,0.95) 100%)',
          '--border-style': 'none',
          boxShadow: '0 1px 0 rgba(0,0,0,0.05)'
        }}>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/profile" text="Atrás" />
          </IonButtons>
          <IonTitle style={{ 
            fontWeight: '700',
            letterSpacing: '-0.01em'
          }}>
            {document ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <span style={{ fontSize: '20px' }}>{document.icon}</span>
                <span>{document.title}</span>
              </div>
            ) : 'Documento Legal'}
          </IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen style={{ 
        '--background': 'linear-gradient(180deg, #fafafa 0%, #ffffff 100%)'
      }}>
        {/* Hero Section */}
        {document && !loading && !error && (
          <div style={{
            background: 'linear-gradient(135deg, rgba(0,113,227,0.08) 0%, rgba(88,86,214,0.08) 100%)',
            padding: '40px 24px 32px 24px',
            textAlign: 'center',
            borderBottom: '1px solid rgba(0,0,0,0.05)'
          }}>
            <div style={{
              fontSize: '48px',
              marginBottom: '16px'
            }}>
              {document.icon}
            </div>
            <h1 style={{
              fontSize: '28px',
              fontWeight: '800',
              background: 'linear-gradient(135deg, var(--ion-color-primary) 0%, #5856d6 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '-0.02em',
              margin: '0 0 12px 0',
              lineHeight: '1.2'
            }}>
              {document.title}
            </h1>
            <p style={{
              color: 'var(--ion-color-medium)',
              fontSize: '14px',
              fontWeight: '500',
              letterSpacing: '-0.01em',
              margin: 0
            }}>
              Última actualización: Diciembre 2024
            </p>
          </div>
        )}

        {/* Content Container */}
        <div style={{ 
          padding: '24px',
          maxWidth: '800px',
          margin: '0 auto',
          paddingBottom: '100px'
        }}>
          {loading && (
            <div style={{ 
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center', 
              alignItems: 'center',
              minHeight: '300px',
              gap: '16px'
            }}>
              <IonSpinner name="circular" style={{ 
                width: '48px',
                height: '48px',
                '--color': 'var(--ion-color-primary)'
              }} />
              <p style={{
                color: 'var(--ion-color-medium)',
                fontSize: '14px',
                fontWeight: '500',
                letterSpacing: '-0.01em'
              }}>
                Cargando documento...
              </p>
            </div>
          )}
          
          {error && (
            <div style={{
              background: 'linear-gradient(135deg, rgba(255,59,48,0.1) 0%, rgba(255,59,48,0.05) 100%)',
              border: '1px solid rgba(255,59,48,0.2)',
              padding: '24px',
              borderRadius: '16px',
              textAlign: 'center',
              marginTop: '40px'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
              <p style={{
                color: 'var(--ion-color-danger)',
                fontSize: '15px',
                fontWeight: '600',
                margin: 0,
                letterSpacing: '-0.01em'
              }}>
                {error}
              </p>
            </div>
          )}
          
          {!loading && !error && content && (
            <div style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(250,250,252,0.98) 100%)',
              borderRadius: '24px',
              padding: '40px 28px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.06), 0 2px 8px rgba(0,0,0,0.04), 0 0 1px rgba(0,0,0,0.04)',
              border: '1px solid rgba(0,0,0,0.06)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              {/* Decorative corner accents */}
              <div style={{
                position: 'absolute',
                top: 0,
                right: 0,
                width: '120px',
                height: '120px',
                background: 'linear-gradient(225deg, rgba(0,113,227,0.04) 0%, transparent 100%)',
                borderRadius: '0 0 0 120px',
                pointerEvents: 'none'
              }}></div>
              <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                width: '120px',
                height: '120px',
                background: 'linear-gradient(45deg, rgba(88,86,214,0.04) 0%, transparent 100%)',
                borderRadius: '0 120px 0 0',
                pointerEvents: 'none'
              }}></div>
              
              <div 
                style={{ 
                  fontSize: '15px',
                  lineHeight: '1.8',
                  color: 'var(--ion-color-medium)',
                  letterSpacing: '-0.01em',
                  position: 'relative',
                  zIndex: 1
                }}
                dangerouslySetInnerHTML={{ 
                  __html: `<div>${formatMarkdown(content)}</div>` 
                }}
              />
            </div>
          )}
        </div>

        {/* Footer Badge */}
        {!loading && !error && content && (
          <div style={{
            padding: '32px 24px 100px 24px',
            textAlign: 'center'
          }}>
            <div style={{
              display: 'inline-block',
              padding: '8px 20px',
              borderRadius: '20px',
              background: 'rgba(0, 113, 227, 0.08)',
              border: '1px solid rgba(0, 113, 227, 0.12)'
            }}>
              <span style={{
                fontSize: '13px',
                fontWeight: '600',
                background: 'linear-gradient(135deg, var(--ion-color-primary) 0%, #5856d6 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                letterSpacing: '-0.01em'
              }}>
                LotoLink Legal
              </span>
            </div>
          </div>
        )}
      </IonContent>
    </IonPage>
  );
};

export default LegalDocument;
