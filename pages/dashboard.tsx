import { useContext } from "react"
import { Can } from "../componentes/Can"
import { AuthContext } from "../contexts/AuthContext"
import { useCan } from "../hooks/useCan"
import { setupAuthClient } from "../services/api"
import { withSSRAuth } from "../utils/withSSRAuth"

export default function Dashboard() {


  const { user, signOut } = useContext(AuthContext)

  return (
    <>
      <h1>DashBoard: {user?.email}</h1>

      <button onClick={() => signOut()} >Sign out</button>

      <Can permissions={['metrics.list']}>
        <div>Métricas</div>
      </Can>
    </>
  )
}

export const getServerSideProps = withSSRAuth(async (ctx) => {

  const api = setupAuthClient(ctx)

  const { data } = await api.get('/me')

  console.log(data)

  return {
    props: {}
  }
})