import React, { ChangeEvent, useEffect, useState } from 'react';
import { Form, Formik, Field, useFormikContext } from 'formik';
import { object, string, number, boolean, mixed } from 'yup';
import Select from '@/components/elements/Select';
import Button from '@/components/elements/Button';
import Spinner from '@/components/elements/Spinner';
import StoreError from '@/components/elements/StoreError';
import StoreContainer from '@/components/elements/StoreContainer';
import TitledGreyBox from '@/components/elements/TitledGreyBox';
import FlashMessageRender from '@/components/elements/FlashMessageRender';
import InputSpinner from '@/components/elements/InputSpinner';
import PageContentBlock from '@/components/elements/PageContentBlock';
import { getResources, getNodes, getNests, getEggs, createServer } from '@/api/store';
import { useStoreState } from 'easy-peasy';
import useFlash from '@/plugins/useFlash';
import * as Icon from 'react-feather';
import { faEgg, faList, faStickyNote, faMicrochip, faMemory, faHdd, faNetworkWired, faArchive, faDatabase, faLayerGroup, faCube } from '@fortawesome/free-solid-svg-icons';

interface EggVariable {
    name: string;
    description: string;
    envVariable: string;
    defaultValue: string;
    userViewable: boolean;
    userEditable: boolean;
    rules: string;
    fieldType: string;
}

interface Egg {
    id: number;
    name: string;
    variables: EggVariable[];
}

export default () => {
    const [loading, setLoading] = useState(false);
    const [resources, setResources] = useState();
    const [eggs, setEggs] = useState<Egg[]>();
    const user = useStoreState(state => state.user.data);
    const { clearFlashes, clearAndAddHttpError } = useFlash();
    const [selectedEgg, setSelectedEgg] = useState<Egg>();

    useEffect(() => {
        getResources().then(setResources);
        getEggs().then(setEggs);
    }, []);

    const changeEgg = (e: ChangeEvent<HTMLSelectElement>) => {
        const eggId = parseInt(e.target.value, 10);
        const egg = eggs.find(egg => egg.id === eggId);
        setSelectedEgg(egg);
    };

    const submit = async (values) => {
        setLoading(true);
        try {
            const response = await createServer(values);
            clearFlashes();
            window.location.href = `/server/${response.data.id}`;
        } catch (error) {
            setLoading(false);
            clearAndAddHttpError({ key: 'server:create', error });
        }
    };

    const generateSchema = () => {
        return selectedEgg?.variables.reduce((schema, variable) => {
            const base = variable.rules.includes('required') ? string().required('This field is required') : string();
            schema[variable.envVariable] = base;
            return schema;
        }, {});
    };

    if (!resources || !eggs) return <Spinner size={'large'} centered />;

    return (
        <PageContentBlock title={'Create Server'}>
            <Formik
                initialValues={selectedEgg?.variables.reduce((values, variable) => {
                    values[variable.envVariable] = variable.defaultValue || '';
                    return values;
                }, { eggId: selectedEgg?.id })}
                validationSchema={object().shape(generateSchema())}
                onSubmit={submit}
            >
                <Form>
                    <Select name="eggId" onChange={changeEgg}>
                        {eggs.map(egg => (
                            <option key={egg.id} value={egg.id}>{egg.name}</option>
                        ))}
                    </Select>
                    {selectedEgg && selectedEgg.variables.map(variable => (
                        <TitledGreyBox key={variable.envVariable} title={variable.name} className="mb-6">
                            <Field
                                name={variable.envVariable}
                                type={variable.fieldType}
                                placeholder={variable.description}
                            />
                            <p className="text-sm text-gray-500">{variable.description}</p>
                        </TitledGreyBox>
                    ))}
                    <Button type="submit" disabled={loading}>
                        Create Server
                    </Button>
                </Form>
            </Formik>
        </PageContentBlock>
    );
};
