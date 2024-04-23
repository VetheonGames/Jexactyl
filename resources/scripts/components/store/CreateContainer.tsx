import React, { ChangeEvent, useEffect, useState } from 'react';
import { Form, Formik, Field } from 'formik';
import { object, string, number } from 'yup';
import Select from '@/components/elements/Select';
import Button from '@/components/elements/Button';
import Spinner from '@/components/elements/Spinner';
import StoreError from '@/components/elements/StoreError';
import StoreContainer from '@/components/elements/StoreContainer';
import TitledGreyBox from '@/components/elements/TitledGreyBox';
import FlashMessageRender from '@/components/FlashMessageRender';
import InputSpinner from '@/components/elements/InputSpinner';
import PageContentBlock from '@/components/elements/PageContentBlock';
import { getResources, getNodes, getNests, getEggs, createServer } from '@/api/store';
import { useStoreState } from 'easy-peasy';
import useFlash from '@/plugins/useFlash';
import * as Icon from 'react-feather';
import { faEgg, faList, faStickyNote, faMicrochip, faMemory, faHdd, faNetworkWired, faArchive, faDatabase, faLayerGroup, faCube } from '@fortawesome/free-solid-svg-icons';

interface CreateValues {
    name: string;
    description: string | null;
    cpu: number;
    memory: number;
    disk: number;
    ports: number;
    backups: number | null;
    databases: number | null;
    egg: number;
    nest: number;
    node: number;
    steamUsername?: string;
    steamPassword?: string;
    steamGuard?: string;
}

interface Egg {
    id: number;
    name: string;
    isSteamGame: boolean; // Indicates if the egg is for a Steam game
}

export default () => {
    const [loading, setLoading] = useState(false);
    const [resources, setResources] = useState<Resources>();

    const user = useStoreState((state) => state.user.data!);
    const { clearFlashes, clearAndAddHttpError } = useFlash();

    const [egg, setEgg] = useState<number>(0);
    const [eggs, setEggs] = useState<Egg[]>();
    const [nest, setNest] = useState<number>(0);
    const [nests, setNests] = useState<Nest[]>();
    const [node, setNode] = useState<number>(0);
    const [nodes, setNodes] = useState<Node[]>();

    useEffect(() => {
        clearFlashes();
        getResources().then(setResources);
        getEggs().then(setEggs);
        getNests().then(setNests);
        getNodes().then(setNodes);
    }, []);

    const changeNest = (e: ChangeEvent<HTMLSelectElement>) => {
        const nestId = parseInt(e.target.value);
        setNest(nestId);
        getEggs(nestId).then((eggs) => {
            setEggs(eggs);
            setEgg(eggs[0].id);
        });
    };

    const submit = (values: CreateValues) => {
        setLoading(true);
        clearFlashes('store:create');
        createServer(values, egg, nest, node)
            .then((data) => {
                if (!data.id) return;
                setLoading(false);
                clearFlashes('store:create');
                window.location = `/server/${data.id}`;
            })
            .catch((error) => {
                setLoading(false);
                clearAndAddHttpError({ key: 'store:create', error });
            });
    };

    if (!resources) return <Spinner size={'large'} centered />;

    if (!nodes) return <StoreError message={'No nodes are available for deployment. Try again later.'} admin={'Ensure you have at least one node that can be deployed to.'} />;

    if (!nests || !eggs) return <StoreError message={'No server types are available for deployment. Try again later.'} admin={'Ensure you have at least one egg which is in a public nest.'} />;

    return (
        <PageContentBlock title={'Create Server'} showFlashKey={'store:create'}>
            <Formik
                onSubmit={submit}
                initialValues={{
                    name: `${user.username}'s server`,
                    description: 'Write a server description here.',
                    cpu: resources.cpu,
                    memory: resources.memory,
                    disk: resources.disk,
                    ports: resources.ports,
                    backups: resources.backups,
                    databases: resources.databases,
                    nest: 1,
                    egg: 1,
                    node: 1,
                }}
                validationSchema={object().shape({
                    name: string().required().min(3),
                    description: string().optional().min(3).max(191),
                    cpu: number().required().min(25).max(resources.cpu),
                    memory: number().required().min(256).max(resources.memory),
                    disk: number().required().min(256).max(resources.disk),
                    ports: number().required().min(1).max(resources.ports),
                    backups: number().optional().max(resources.backups),
                    databases: number().optional().max(resources.databases),
                    node: number().required().default(node),
                    nest: number().required().default(nest),
                    egg: number().required().default(egg),
                    steamUsername: string().when('egg', {
                        is: (eggId) => eggs.find(e => e.id === eggId)?.isSteamGame,
                        then: string().required('Steam username is required for this game'),
                        otherwise: string().nullable(),
                    }),
                    steamPassword: string().when('egg', {
                        is: (eggId) => eggs.find(e => e.id === eggId)?.isSteamGame,
                        then: string().required('Steam password is required for this game'),
                        otherwise: string().nullable(),
                    }),
                    steamGuard: string().when('egg', {
                        is: (eggId) => eggs.find(e => e.id === eggId)?.isSteamGame,
                        then: string().required('Steam Guard code is required for this game'),
                        otherwise: string().nullable(),
                    }),
                })}
            >
                {({ values }) => (
                    <Form>
                        {/* Existing UI components here... */}
                        {values.egg && eggs.find(e => e.id === values.egg)?.isSteamGame && (
                            <StoreContainer className={'lg:grid lg:grid-cols-3 my-10 gap-4'}>
                                <TitledGreyBox title={'Steam Credentials'} icon={faStickyNote} className={'mt-8 sm:mt-0'}>
                                    <Field name={'steamUsername'} placeholder={'Steam Username'} />
                                    <Field name={'steamPassword'} placeholder={'Steam Password'} type={'password'} />
                                    <Field name={'steamGuard'} placeholder={'Steam Guard Code'} />
                                    <p className={'mt-1 text-xs'}>Enter your Steam credentials for this game.</p>
                                </TitledGreyBox>
                            </StoreContainer>
                        )}
                        <InputSpinner visible={loading}>
                            <FlashMessageRender byKey={'store:create'} className={'my-2'} />
                            <div className={'text-right'}>
                                <Button
                                    type={'submit'}
                                    className={'w-1/6 mb-4'}
                                    size={Button.Sizes.Large}
                                    disabled={loading}
                                >
                                    <Icon.Server className={'mr-2'} /> Create
                                </Button>
                            </div>
                        </InputSpinner>
                    </Form>
                )}
            </Formik>
        </PageContentBlock>
    );
};
