import Vuex from 'vuex';
// Create Vuex.store for projects

const createStore = () =>
  new Vuex.Store({
    state: {
      loadedProjects: []
    },
    mutations: {
      setPosts(state, projects) {
        state.loadedProjects = projects;
      }
    },
    actions: {
      nuxtServerInit(vuexContext, context) {
        console.log('nuxt server HEEII');
        return context.app.$axios
          .$get('https://hanninen-website.firebaseio.com/projects.json')
          .then(data => {
            console.log(data);
            //     const postsArray = [];
            //     for (const key in data) {
            //       postsArray.push({ ...data[key], id: key });
            //     }
            //     vuexContext.commit('setPosts', postsArray);
          })
          .catch(e => context.error(e));
      },

      setPosts(vuexContext, projects) {
        vuexContext.commit('setPosts', projects);
      }
    },
    getters: {
      loadedProjects(state) {
        return state.loadedProjects;
      }
    }
  });

export default createStore;
