import tw from 'twin.macro';
import { Form } from 'formik';
import { breakpoint } from '@/theme';
import React, { forwardRef } from 'react';
import styled from 'styled-components/macro';
import FlashMessageRender from '@/components/FlashMessageRender';
import { useStoreState } from '@/state/hooks';

type Props = React.DetailedHTMLProps<React.FormHTMLAttributes<HTMLFormElement>, HTMLFormElement> & {
    title?: string;
};

const Container = styled.div`
    ${breakpoint('sm')`
        ${tw`w-4/5 mx-auto`}
    `};

    ${breakpoint('md')`
        ${tw`p-10`}
    `};

    ${breakpoint('lg')`
        ${tw`w-3/5`}
    `};

    ${breakpoint('xl')`
        ${tw`w-full`}
        max-width: 700px;
    `};
`;

export default forwardRef<HTMLFormElement, Props>(({ title, ...props }, ref) => {
    const logo = useStoreState((state) => state.settings.data?.logo);

    return (
        <Container>
            {title && <h2 className={`text-3xl text-center text-neutral-100 font-medium py-4`}>{title}</h2>}
            <FlashMessageRender className={`mb-2 px-1`} />
            <Form {...props} ref={ref}>
                <div className={`md:flex w-full bg-neutral-900 shadow-lg rounded-lg p-6 md:pl-0 mx-1`}>
                    <div className={`flex-none select-none mb-6 md:mb-0 self-center`}>
                        <img src={logo ?? '/assets/svgs/pterodactyl.svg'} className={`block w-48 md:w-64 mx-auto`} />
                    </div>
                    <div className={`flex-1`}>{props.children}</div>
                </div>
            </Form>
            <p className={`text-neutral-500 text-xs mt-6 sm:float-left`}>
                &copy; <a href={'https://jexactyl.com'}>Jexactyl,</a> built on{' '}
                <a href={'https://pterodactyl.io'}>Pterodactyl.</a>
            </p>
            <p className={`text-neutral-500 text-xs mt-6 sm:float-right`}>
                <a href={'https://jexactyl.com'}> Site </a>
                &bull;
                <a href={'https://github.com/jexactyl/jexactyl'}> GitHub </a>
            </p>
        </Container>
    );
});
