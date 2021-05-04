import { setupAuthClient } from "../services/api"
import { withSSRAuth } from "../utils/withSSRAuth"


export default function Metrics() {

  return (
    <>
      <h1>Metrics</h1>
    </>
  )
}

export const getServerSideProps = withSSRAuth(async (ctx) => {

  const api = setupAuthClient(ctx)

  const { data } = await api.get('/me')

  return {
    props: {}
  }
}, { permissions: ['metrics.list'], roles: ['administrator'] })