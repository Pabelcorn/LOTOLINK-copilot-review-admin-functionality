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
const LEGAL_DOCUMENTS: Record<string, { title: string; path: string }> = {
  'privacy-policy': {
    title: 'Política de Privacidad',
    path: '/POLITICA_DE_PRIVACIDAD.md'
  },
  'terms-conditions': {
    title: 'Términos y Condiciones',
    path: '/TERMINOS_Y_CONDICIONES.md'
  },
  'legal-declaration': {
    title: 'Declaración Legal',
    path: '/DECLARACION_LEGAL.md'
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

  // Convert markdown to basic HTML for display
  // Note: This is a simple markdown parser for controlled content (legal documents).
  // For user-generated content, consider using a dedicated library like react-markdown.
  const formatMarkdown = (markdown: string): string => {
    let html = markdown
      // Escape any existing HTML to prevent XSS
      // Note: This escapes before markdown processing, so raw HTML in markdown won't render
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      // Headers (must be done before other replacements)
      .replace(/^### (.*$)/gim, '<h3 style="font-size: 18px; font-weight: 700; margin: 24px 0 12px 0; color: var(--ion-color-dark);">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 style="font-size: 20px; font-weight: 700; margin: 32px 0 16px 0; color: var(--ion-color-dark);">$2</h2>')
      .replace(/^# (.*$)/gim, '<h1 style="font-size: 24px; font-weight: 700; margin: 32px 0 16px 0; color: var(--ion-color-primary);">$1</h1>')
      // Bold
      .replace(/\*\*(.*?)\*\*/gim, '<strong style="font-weight: 700; color: var(--ion-color-dark);">$1</strong>')
      // Line breaks and paragraphs
      .replace(/\n\n/g, '</p><p style="margin: 16px 0; line-height: 1.6; color: var(--ion-color-medium);">')
      .replace(/\n/g, '<br>');

    // Handle lists by wrapping consecutive list items
    html = html.replace(/((?:^- .*$\n?)+)/gim, (match) => {
      const items = match.split('\n')
        .filter(line => line.trim())
        .map(line => line.replace(/^- (.*)$/, '<li style="margin: 8px 0; line-height: 1.6;">$1</li>'))
        .join('');
      return `<ul style="margin: 16px 0; padding-left: 24px;">${items}</ul>`;
    });

    return html;
  };

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar className="premium-header">
          <IonButtons slot="start">
            <IonBackButton defaultHref="/profile" text="Atrás" />
          </IonButtons>
          <IonTitle style={{ fontWeight: '700' }}>
            {document ? document.title : 'Documento Legal'}
          </IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <div style={{ 
          padding: '16px',
          maxWidth: '800px',
          margin: '0 auto',
          paddingBottom: '100px'
        }}>
          {loading && (
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center',
              minHeight: '200px'
            }}>
              <IonSpinner name="circular" color="primary" />
            </div>
          )}
          
          {error && (
            <div style={{
              background: 'var(--ion-color-danger-tint)',
              padding: '16px',
              borderRadius: '12px',
              color: 'var(--ion-color-danger-contrast)',
              textAlign: 'center'
            }}>
              {error}
            </div>
          )}
          
          {!loading && !error && content && (
            <div 
              style={{ 
                fontSize: '14px',
                lineHeight: '1.6',
                margin: '16px 0'
              }}
              dangerouslySetInnerHTML={{ 
                __html: `<div>${formatMarkdown(content)}</div>` 
              }}
            />
          )}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default LegalDocument;
