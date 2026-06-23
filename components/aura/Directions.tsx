import styles from "./Directions.module.css";
import { conference } from "@/lib/conference";

/* 오시는 길 · 문의 (Aura 전용 포크) — 위치(건물·호수·주소·지도) + 대중교통 + 주차 + 문의.
   (forked from components/aura1/Directions.tsx — independent of /aura1.)

   레이아웃·톤은 개요의 Information 블록(EventInfo / Overview.facts)과 동일하게 맞춘다:
   라벨은 값 위에 쌓고 블랙, 값은 다크. 주황은 '클릭되는 것'(지도/주차 안내 칩, 메일)에만.
   콘텐츠 = conference.directions. */
export default function Directions() {
  const { place, address, mapLinks, transit, parking, parkingLink, contact } =
    conference.directions;

  return (
    <section id="venue" className={styles.venue}>
      <h2 className={styles.heading}>location &amp; contact</h2>

      <dl className={styles.facts}>
        <div className={styles.fact}>
          <dt className={styles.factLabel}>장소</dt>
          <dd className={styles.factValue}>{place}</dd>
        </div>

        <div className={styles.fact}>
          <dt className={styles.factLabel}>주소</dt>
          <dd className={styles.factValue}>
            {address}
            <span className={styles.chips}>
              {mapLinks.map((m) => (
                <a
                  key={m.label}
                  className={styles.chip}
                  href={m.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {m.label}
                  <span aria-hidden="true" className={styles.chipArrow}>
                    ↗
                  </span>
                </a>
              ))}
            </span>
          </dd>
        </div>

        <div className={styles.fact}>
          <dt className={styles.factLabel}>대중교통</dt>
          <dd className={styles.factValue}>
            <ul className={styles.lines}>
              {transit.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </dd>
        </div>

        <div className={`${styles.fact} ${styles.wide}`}>
          <dt className={styles.factLabel}>주차</dt>
          <dd className={styles.factValue}>
            {parking}
            <span className={styles.chips}>
              <a
                className={styles.chip}
                href={parkingLink.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                {parkingLink.label}
                <span aria-hidden="true" className={styles.chipArrow}>
                  ↗
                </span>
              </a>
            </span>
          </dd>
        </div>

        <div className={`${styles.fact} ${styles.wide}`}>
          <dt className={styles.factLabel}>문의</dt>
          <dd className={styles.factValue}>
            <span className={styles.contactOrg}>{contact.org}</span>
            <a className={styles.contactLink} href={`mailto:${contact.email}`}>
              {contact.email}
            </a>
            <span className={styles.hours}>{contact.hours}</span>
          </dd>
        </div>
      </dl>
    </section>
  );
}
