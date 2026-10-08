import type { LoaderFunctionArgs } from "react-router";
import { redirect, Form, useLoaderData } from "react-router";

import { login } from "../../shopify.server";

import styles from "./styles.module.css";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);

  if (url.searchParams.get("shop")) {
    throw redirect(`/app?${url.searchParams.toString()}`);
  }

  return { showForm: Boolean(login) };
};

export default function App() {
  const { showForm } = useLoaderData<typeof loader>();

  return (
    <div className={styles.index}>
      <div className={styles.content}>
        <h1 className={styles.heading}>Mekupelet VR360</h1>
        <p className={styles.text}>חשבוניות מס/קבלה וסנכרון מלאי מול Verifone VR360.</p>
        {showForm && (
          <Form className={styles.form} method="post" action="/auth/login">
            <label className={styles.label}>
              <span>כתובת החנות</span>
              <input className={styles.input} type="text" name="shop" />
              <span>לדוגמה: my-shop.myshopify.com</span>
            </label>
            <button className={styles.button} type="submit">
              כניסה
            </button>
          </Form>
        )}
      </div>
    </div>
  );
}
