

interface DatabaseFormData {
  name: string;
  dbms: string;
  host: string;
  port: number | null;
  databaseName: string;
  username: string;
  password: string;
}

const EditForm = () => {
    return (
        <form action={formAction} className="space-y-4">
        <input type="hidden" name="id" value={databaseId} />
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            データベース名
          </label>
          <input
            type="text"
            name="name"
            id="name"
            defaultValue={initialData.name}
            placeholder="データベース名を入力"
            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
          {state.errors?.name && (
            <p className="mt-1 text-sm text-red-600">{state.errors.name[0]}</p>
          )}
        </div>
        <div>
          <label htmlFor="dbms" className="block text-sm font-medium text-gray-700">
            DBMS
          </label>
          <select
            name="dbms"
            id="dbms"
            defaultValue={initialData.dbms}
            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="PostgreSQL">PostgreSQL</option>
            <option value="MySQL">MySQL</option>
            <option value="SQLite">SQLite</option>
            <option value="Oracle">Oracle</option>
          </select>
          {state.errors?.dbms && (
            <p className="mt-1 text-sm text-red-600">{state.errors.dbms[0]}</p>
          )}
        </div>
        <div>
          <label htmlFor="host" className="block text-sm font-medium text-gray-700">
            ホスト
          </label>
          <input
            type="text"
            name="host"
            id="host"
            defaultValue={initialData.host}
            placeholder="ホストを入力（例: localhost）"
            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
          {state.errors?.host && (
            <p className="mt-1 text-sm text-red-600">{state.errors.host[0]}</p>
          )}
        </div>
        <div>
          <label htmlFor="port" className="block text-sm font-medium text-gray-700">
            ポート（任意）
          </label>
          <input
            type="number"
            name="port"
            id="port"
            defaultValue={initialData.port ?? undefined}
            placeholder="ポートを入力（例: 5432）"
            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
          {state.errors?.port && (
            <p className="mt-1 text-sm text-red-600">{state.errors.port[0]}</p>
          )}
        </div>
        <div>
          <label htmlFor="databaseName" className="block text-sm font-medium text-gray-700">
            データベース名（物理名）
          </label>
          <input
            type="text"
            name="databaseName"
            id="databaseName"
            defaultValue={initialData.databaseName}
            placeholder="データベース名を入力"
            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
          {state.errors?.databaseName && (
            <p className="mt-1 text-sm text-red-600">{state.errors.databaseName[0]}</p>
          )}
        </div>
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-gray-700">
            ユーザー名
          </label>
          <input
            type="text"
            name="username"
            id="username"
            defaultValue={initialData.username}
            placeholder="ユーザー名を入力"
            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
          {state.errors?.username && (
            <p className="mt-1 text-sm text-red-600">{state.errors.username[0]}</p>
          )}
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            パスワード
          </label>
          <input
            type="password"
            name="password"
            id="password"
            defaultValue={initialData.password}
            placeholder="パスワードを入力"
            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
          {state.errors?.password && (
            <p className="mt-1 text-sm text-red-600">{state.errors.password[0]}</p>
          )}
        </div>
        {state.errors?._form && (
          <p className="text-sm text-red-600">{state.errors._form[0]}</p>
        )}
        <div className="flex space-x-4">
          <button
            type="submit"
            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
          >
            更新
          </button>
          <button
            type="button"
            onClick={() => router.push('/databases')}
            className="flex-1 bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition"
          >
            キャンセル
          </button>
          <button
            type="button"
            onClick={() => {
              const form = document.querySelector('form');
              console.log(form)
              if (form) testAction(new FormData(form));
            }}
            className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition"
          >
            接続テスト
          </button>
        </div>
      </form>
    )
}