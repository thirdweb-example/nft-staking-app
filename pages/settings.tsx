import type { NextPage } from "next"
import styles from "../styles/Home.module.css"
import navBlock from "../components/navBlock"


const Settings: NextPage = () => {
  return (
    <div className={styles.container}>
      {navBlock(`settings`, true)}
      <h1 className={styles.h1}>Settings</h1>

    </div>
  );
};

export default Settings;
