import React from 'react';

import { object, string } from 'yup';
import { ApplicationStore } from '@/state';
import { httpErrorToHuman } from '@/api/http';
import { ServerContext } from '@/state/server';
import Field from '@/components/elements/Field';
import Label from '@/components/elements/Label';
import renameServer from '@/api/server/renameServer';
import { Actions, useStoreActions } from 'easy-peasy';
import { Textarea } from '@/components/elements/Input';
import { Button } from '@/components/elements/button/index';
import TitledGreyBox from '@/components/elements/TitledGreyBox';
import SpinnerOverlay from '@/components/elements/SpinnerOverlay';
import FormikFieldWrapper from '@/components/elements/FormikFieldWrapper';
import { Field as FormikField, Form, Formik, FormikHelpers, useFormikContext } from 'formik';

interface Values {
    name: string;
    description: string;
}

const RenameServerBox = () => {
    const { isSubmitting } = useFormikContext<Values>();

    return (
        <TitledGreyBox title={'Change Server Details'} className={`relative`}>
            <SpinnerOverlay visible={isSubmitting} />
            <Form className={`mb-0`}>
                <Field id={'name'} name={'name'} label={'Server Name'} type={'text'} />
                <div className={`mt-6`}>
                    <Label>Server Description</Label>
                    <FormikFieldWrapper name={'description'}>
                        <FormikField as={Textarea} name={'description'} rows={3} />
                    </FormikFieldWrapper>
                </div>
                <div className={`mt-6 text-right`}>
                    <Button type={'submit'}>Save</Button>
                </div>
            </Form>
        </TitledGreyBox>
    );
};

export default () => {
    const server = ServerContext.useStoreState((state) => state.server.data!);
    const setServer = ServerContext.useStoreActions((actions) => actions.server.setServer);
    const { addError, clearFlashes } = useStoreActions((actions: Actions<ApplicationStore>) => actions.flashes);

    const submit = ({ name, description }: Values, { setSubmitting }: FormikHelpers<Values>) => {
        clearFlashes('settings');
        renameServer(server.uuid, name, description)
            .then(() => setServer({ ...server, name, description }))
            .catch((error) => {
                console.error(error);
                addError({ key: 'settings', message: httpErrorToHuman(error) });
            })
            .then(() => setSubmitting(false));
    };

    return (
        <Formik
            onSubmit={submit}
            initialValues={{
                name: server.name,
                description: server.description,
            }}
            validationSchema={object().shape({
                name: string().required().min(1),
                description: string().nullable(),
            })}
        >
            <RenameServerBox />
        </Formik>
    );
};
