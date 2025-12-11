import FormBuilder from './form-builder';

export default async function CategoryFormPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const { id } = params;
    return <FormBuilder id={id} />;
}
