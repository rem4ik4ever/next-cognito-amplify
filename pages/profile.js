import { API, withSSRContext } from 'aws-amplify';
import { useState } from 'react';
import { createUser, updateUser } from 'src/graphql/mutations';
import { getUser } from 'src/graphql/queries';

const Profile = ({ user = {}, mode, error }) => {
  const [profile, setProfile] = useState({
    firstName: user.firstName,
    lastName: user.lastName,
    description: user.description,
  });

  const handleChange = field => ev => {
    setProfile({
      ...profile,
      [field]: ev.target.value
    });
  };

  const handleSubmit = async ev => {
    ev.preventDefault();
    console.log({ currentUser: user });
    try {
      const result = await API.graphql({
        query: mode === 'EDIT' ? updateUser : createUser,
        variables: {
          input: {
            id: user.id,
            ...profile
          }
        }
      });
      console.log({ result });
    } catch (err) {
      console.error(err);
    }
  };

  if(error) {
    return <h2>Oops, something went wrong</h2>
  }

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: 300,
          margin: '30%'
        }}
      >
        <label>
          First Name:{' '}
          <input
            type="text"
            onChange={handleChange('firstName')}
            value={profile.firstName}
          />
        </label>
        <label>
          Last Name:{' '}
          <input
            type="text"
            onChange={handleChange('lastName')}
            value={profile.lastName}
          />
        </label>
        <label>
          Description:{' '}
          <input
            type="text"
            onChange={handleChange('description')}
            value={profile.description}
          />
        </label>
        <button type="submit">Save</button>
      </form>
    </div>
  );
};

export async function getServerSideProps({ req, res }) {
  const { Auth, API } = withSSRContext({ req });
  try {
    const currentUser = await Auth.currentAuthenticatedUser();
    const response = await API.graphql({
      query: getUser,
      variables: {
        id: currentUser.attributes.sub
      }
    });
    if (response.data.getUser) {
      return {
        props: {
          mode: 'EDIT',
          user: response.data.getUser,
          error: false
        }
      };
    } else {
      return {
        props: {
          mode: 'ADD',
          error: false
        }
      };
    }
  } catch (err) {
    console.log(err);
    return {
      props: {
        error: true
      }
    };
  }
}

export default Profile;
