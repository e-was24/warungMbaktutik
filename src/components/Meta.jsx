import { Helmet } from 'react-helmet-async';

function Meta({ title, description }) {

    const defaultTitle = "Warung Mbak Tutik - Seblak, Bakaran, Es";
    const defaultDesc = "Pengen yang pedas dan segar? Yuk mampir ke Warung Mbak Tutik! Menyediakan Seblak gurih nagih, aneka Bakaran bumbu meresap, dan Es segar pelepas dahaga. Buka setiap hari jam 09.00 - 19.00 WIB. Rasanya mantap, harganya bersahabat!";

    return (
        <Helmet>
            <title>{title || defaultTitle}</title>
            <meta name="description" content={description || defaultDesc} />


            <meta property="og:title" content={title || defaultTitle} />
            <meta property="og:description" content={description || defaultDesc} />
            <meta property="og:type" content="website" />
        </Helmet>
    );
}

export default Meta;