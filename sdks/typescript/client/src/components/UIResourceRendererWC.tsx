/* eslint-disable @typescript-eslint/no-explicit-any */
import r2wc from '@r2wc/react-to-web-component';
import { UIResourceRenderer, type UIResourceRendererProps } from './UIResourceRenderer';
import { FC, useCallback, useRef } from 'react';

type Resource = any;

type UIResourceRendererWCProps = Omit<UIResourceRendererProps, 'resource' | 'onUIAction'> & {
    resource?: Resource | string;
};

function parseJsonProp(prop: any): any {
    if (typeof prop === 'object' && prop !== null) {
        return prop;
    }
    if (typeof prop === 'string' && prop.trim() !== '') {
      try {
        return JSON.parse(prop);
      } catch (e) {
        console.error('Failed to parse JSON prop:', prop);
        return undefined;
      }
    }
    return prop;
}

export const UIResourceRendererWCWrapper: FC<UIResourceRendererWCProps> = (props) => {
    const {
        resource: rawResource,
        supportedContentTypes: rawSupportedContentTypes,
        htmlProps: rawHtmlProps,
        remoteDomProps: rawRemoteDomProps,
    } = props;

    const resource = parseJsonProp(rawResource);
    const supportedContentTypes = parseJsonProp(rawSupportedContentTypes);
    const htmlProps = parseJsonProp(rawHtmlProps);
    const remoteDomProps = parseJsonProp(rawRemoteDomProps);

    const ref = useRef<HTMLElement>(null);

    const onUIActionCallback = useCallback(async (event: any): Promise<void> => {
        if (ref.current) {
            const customEvent = new CustomEvent('onUIAction', { 
                detail: event,
                composed: true,
                bubbles: true,
            });
            ref.current.dispatchEvent(customEvent);
        }
    }, []);

    if (!resource) {
        return <p className="text-red-500">Resource not provided.</p>;
    }
    
    return (
        <div ref={ref as React.RefObject<HTMLDivElement>}>
            <UIResourceRenderer
                resource={resource}
                supportedContentTypes={supportedContentTypes}
                htmlProps={htmlProps}
                remoteDomProps={remoteDomProps}
                onUIAction={onUIActionCallback}
            />
        </div>
    );
};

customElements.define('ui-resource-renderer', r2wc(UIResourceRendererWCWrapper, {
    props: {
        resource: 'json',
        supportedContentTypes: 'json',
        htmlProps: 'json',
        remoteDomProps: 'json'
    }
}));
