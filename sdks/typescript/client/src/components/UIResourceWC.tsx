/* eslint-disable @typescript-eslint/no-explicit-any */
import r2wc from '@r2wc/react-to-web-component';
import { UIResourceRenderer, type UIResourceRendererProps } from './UIResourceRenderer';
import React, { useCallback, useRef } from 'react';

// Using 'any' as a workaround for the persistent module resolution issue.
type Resource = any;

type UIResourceWCProps = Omit<UIResourceRendererProps, 'resource' | 'onUIAction'> & {
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

export const UIResourceWCWrapper: React.FC<UIResourceWCProps> = (props) => {
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
        <div ref={ref as any}>
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

customElements.define('ui-resource-renderer', r2wc(UIResourceWCWrapper, {
    props: {
        resource: 'json',
        supportedContentTypes: 'json',
        htmlProps: 'json',
        remoteDomProps: 'json'
    }
}));
