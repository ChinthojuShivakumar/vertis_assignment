
import PropTypes from 'prop-types'
import { Helmet } from 'react-helmet'

const Metadata = ({ title, description, url }) => {
    return (
        <Helmet>
            <title>{title}</title>
            <meta name="description" content={description} />
            <meta property="og:title" content={title} />
            <meta property="og:description" content={description} />
            <meta property="og:image" content="/Logo.png" />
            <meta property="og:url" content={url} />
            <link rel="icon" type="image/svg+xml" href="/Logo.png" />

        </Helmet>
    )
}

Metadata.propTypes = {
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    url: PropTypes.string.isRequired
}
export default Metadata