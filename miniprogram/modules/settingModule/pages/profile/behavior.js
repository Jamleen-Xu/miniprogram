import { BehaviorWithStore } from 'mobx-miniprogram-bindings'
import { userStore  } from '../../../../stores/userstore'

export const profileBehavior = BehaviorWithStore({
	storeBindings: {
		store: userStore,
		fields: ['userInfo'],
		actions: ['setUserInfo']
	}
})