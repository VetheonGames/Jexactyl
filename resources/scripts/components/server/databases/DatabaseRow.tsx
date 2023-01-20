import { object, string } from 'yup';
import * as Icon from 'react-feather';
import React, { useState } from 'react';
import useFlash from '@/plugins/useFlash';
import Can from '@/components/elements/Can';
import { httpErrorToHuman } from '@/api/http';
import { ServerContext } from '@/state/server';
import Modal from '@/components/elements/Modal';
import Field from '@/components/elements/Field';
import Label from '@/components/elements/Label';
import Input from '@/components/elements/Input';
import { Form, Formik, FormikHelpers } from 'formik';
import GreyRowBox from '@/components/elements/GreyRowBox';
import { Button } from '@/components/elements/button/index';
import CopyOnClick from '@/components/elements/CopyOnClick';
import FlashMessageRender from '@/components/FlashMessageRender';
import { ServerDatabase } from '@/api/server/databases/getServerDatabases';
import deleteServerDatabase from '@/api/server/databases/deleteServerDatabase';
import RotatePasswordButton from '@/components/server/databases/RotatePasswordButton';
import classNames from 'classnames';

interface Props {
    database: ServerDatabase;
    className?: string;
}

export default ({ database, className }: Props) => {
    const uuid = ServerContext.useStoreState((state) => state.server.data!.uuid);
    const { addError, clearFlashes } = useFlash();
    const [visible, setVisible] = useState(false);
    const [connectionVisible, setConnectionVisible] = useState(false);

    const appendDatabase = ServerContext.useStoreActions((actions) => actions.databases.appendDatabase);
    const removeDatabase = ServerContext.useStoreActions((actions) => actions.databases.removeDatabase);

    const jdbcConnectionString = `jdbc:mysql://${database.username}${
        database.password ? `:${encodeURIComponent(database.password)}` : ''
    }@${database.connectionString}/${database.name}`;

    const schema = object().shape({
        confirm: string()
            .required('The database name must be provided.')
            .oneOf([database.name.split('_', 2)[1], database.name], 'The database name must be provided.'),
    });

    const submit = (values: { confirm: string }, { setSubmitting }: FormikHelpers<{ confirm: string }>) => {
        clearFlashes();
        deleteServerDatabase(uuid, database.id)
            .then(() => {
                setVisible(false);
                setTimeout(() => removeDatabase(database.id), 150);
            })
            .catch((error) => {
                console.error(error);
                setSubmitting(false);
                addError({ key: 'database:delete', message: httpErrorToHuman(error) });
            });
    };

    return (
        <>
            <Formik onSubmit={submit} initialValues={{ confirm: '' }} validationSchema={schema} isInitialValid={false}>
                {({ isSubmitting, isValid, resetForm }) => (
                    <Modal
                        visible={visible}
                        dismissable={!isSubmitting}
                        showSpinnerOverlay={isSubmitting}
                        onDismissed={() => {
                            setVisible(false);
                            resetForm();
                        }}
                    >
                        <FlashMessageRender byKey={'database:delete'} className={`mb-6`} />
                        <h2 className={`text-2xl mb-6`}>Confirm database deletion</h2>
                        <p className={`text-sm`}>
                            Deleting a database is a permanent action, it cannot be undone. This will permanently delete
                            the <strong>{database.name}</strong> database and remove all associated data.
                        </p>
                        <Form className={`m-0 mt-6`}>
                            <Field
                                type={'text'}
                                id={'confirm_name'}
                                name={'confirm'}
                                label={'Confirm Database Name'}
                                description={'Enter the database name to confirm deletion.'}
                            />
                            <div className={`mt-6 text-right`}>
                                <Button
                                    type={'button'}
                                    variant={Button.Variants.Secondary}
                                    className={`mr-2`}
                                    onClick={() => setVisible(false)}
                                >
                                    Cancel
                                </Button>
                                <Button type={'submit'} color={'red'} disabled={!isValid}>
                                    Delete Database
                                </Button>
                            </div>
                        </Form>
                    </Modal>
                )}
            </Formik>
            <Modal visible={connectionVisible} onDismissed={() => setConnectionVisible(false)}>
                <FlashMessageRender byKey={'database-connection-modal'} className={`mb-6`} />
                <h3 className={`mb-6 text-2xl`}>Database connection details</h3>
                <div>
                    <Label>Endpoint</Label>
                    <CopyOnClick text={database.connectionString}>
                        <Input type={'text'} readOnly value={database.connectionString} />
                    </CopyOnClick>
                </div>
                <div className={`mt-6`}>
                    <Label>Connections from</Label>
                    <Input type={'text'} readOnly value={database.allowConnectionsFrom} />
                </div>
                <div className={`mt-6`}>
                    <Label>Username</Label>
                    <CopyOnClick text={database.username}>
                        <Input type={'text'} readOnly value={database.username} />
                    </CopyOnClick>
                </div>
                <Can action={'database.view_password'}>
                    <div className={`mt-6`}>
                        <Label>Password</Label>
                        <CopyOnClick text={database.password}>
                            <Input type={'text'} readOnly value={database.password} />
                        </CopyOnClick>
                    </div>
                </Can>
                <div className={`mt-6`}>
                    <Label>JDBC Connection String</Label>
                    <CopyOnClick text={jdbcConnectionString}>
                        <Input type={'text'} readOnly value={jdbcConnectionString} />
                    </CopyOnClick>
                </div>
                <div className={`mt-6 text-right`}>
                    <Can action={'database.update'}>
                        <RotatePasswordButton databaseId={database.id} onUpdate={appendDatabase} />
                    </Can>
                    <Button variant={Button.Variants.Secondary} onClick={() => setConnectionVisible(false)}>
                        Close
                    </Button>
                </div>
            </Modal>
            <GreyRowBox $hoverable={false} className={classNames('mb-2', className)}>
                <div className={`hidden md:block`}>
                    <Icon.Database />
                </div>
                <div className={`flex-1 ml-4`}>
                    <CopyOnClick text={database.name}>
                        <p className={`text-lg`}>{database.name}</p>
                    </CopyOnClick>
                </div>
                <div className={`ml-8 text-center hidden md:block`}>
                    <CopyOnClick text={database.connectionString}>
                        <p className={`text-sm`}>{database.connectionString}</p>
                    </CopyOnClick>
                    <p className={`mt-1 text-2xs text-neutral-500 uppercase select-none`}>Endpoint</p>
                </div>
                <div className={`ml-8 text-center hidden md:block`}>
                    <p className={`text-sm`}>{database.allowConnectionsFrom}</p>
                    <p className={`mt-1 text-2xs text-neutral-500 uppercase select-none`}>Connections from</p>
                </div>
                <div className={`ml-8 text-center hidden md:block`}>
                    <CopyOnClick text={database.username}>
                        <p className={`text-sm`}>{database.username}</p>
                    </CopyOnClick>
                    <p className={`mt-1 text-2xs text-neutral-500 uppercase select-none`}>Username</p>
                </div>
                <div className={`ml-8`}>
                    <Button
                        variant={Button.Variants.Secondary}
                        className={`mr-2`}
                        onClick={() => setConnectionVisible(true)}
                    >
                        <Icon.Eye />
                    </Button>
                    <Can action={'database.delete'}>
                        <Button.Danger variant={Button.Variants.Secondary} onClick={() => setVisible(true)}>
                            <Icon.Trash />
                        </Button.Danger>
                    </Can>
                </div>
            </GreyRowBox>
        </>
    );
};
